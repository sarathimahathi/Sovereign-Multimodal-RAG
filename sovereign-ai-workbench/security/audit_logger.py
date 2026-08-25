"""
Cryptographic Tamper-Evident Hash-Chained Audit Ledger.
Provides mathematical proof of log integrity for PSU & Defense compliance.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.database.models import AuditLogModel
from backend.app.core.logging import get_logger

logger = get_logger("sovereign_workbench.audit")

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


class CryptographicAuditLedger:
    @staticmethod
    def calculate_block_hash(
        previous_hash: str,
        timestamp_str: str,
        event_type: str,
        entity_id: str,
        event_data: Dict[str, Any]
    ) -> str:
        """
        Computes SHA-256 block hash linking to the previous block.
        """
        payload_str = json.dumps(event_data, sort_keys=True)
        block_content = f"{previous_hash}|{timestamp_str}|{event_type}|{entity_id}|{payload_str}"
        return hashlib.sha256(block_content.encode("utf-8")).hexdigest()

    async def log_event(
        self,
        session: AsyncSession,
        event_type: str,
        entity_type: str,
        entity_id: str,
        event_data: Dict[str, Any],
    ) -> AuditLogModel:
        """
        Appends an immutable audit event to the hash chain.
        """
        # Fetch the latest block to get previous hash and next block index
        query = select(AuditLogModel).order_by(AuditLogModel.block_index.desc()).limit(1)
        result = await session.execute(query)
        last_block = result.scalars().first()

        prev_hash = last_block.sha256_checksum if last_block else GENESIS_HASH
        next_index = (last_block.block_index + 1) if last_block else 0
        now = datetime.now(timezone.utc)
        iso_time = now.isoformat()

        # Compute new cryptographic checksum
        block_hash = self.calculate_block_hash(
            previous_hash=prev_hash,
            timestamp_str=iso_time,
            event_type=event_type,
            entity_id=entity_id,
            event_data=event_data,
        )

        audit_entry = AuditLogModel(
            block_index=next_index,
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            previous_hash=prev_hash,
            sha256_checksum=block_hash,
            event_data={
                **event_data,
                "_timestamp_iso": iso_time,
            },
            timestamp=now,
        )

        session.add(audit_entry)
        await session.flush()
        logger.info(f"Audit log recorded: Block #{next_index} ({event_type}) on {entity_type}:{entity_id} [Hash: {block_hash[:12]}...]")
        return audit_entry

    async def verify_chain_integrity(self, session: AsyncSession) -> Dict[str, Any]:
        """
        Verifies the cryptographic validity of the entire audit chain from genesis.
        """
        query = select(AuditLogModel).order_by(AuditLogModel.block_index.asc())
        result = await session.execute(query)
        blocks: List[AuditLogModel] = list(result.scalars().all())

        if not blocks:
            return {
                "chain_valid": True,
                "total_blocks": 0,
                "genesis_hash": GENESIS_HASH,
                "latest_hash": GENESIS_HASH,
                "broken_block_id": None,
                "verification_status": "EMPTY_CHAIN_VALID",
                "verification_timestamp": datetime.now(timezone.utc).isoformat()
            }

        prev_hash = GENESIS_HASH
        for idx, block in enumerate(blocks):
            stored_data = dict(block.event_data or {})
            timestamp_str = stored_data.pop("_timestamp_iso", block.timestamp.isoformat())
            
            recalculated_hash = self.calculate_block_hash(
                previous_hash=block.previous_hash,
                timestamp_str=timestamp_str,
                event_type=block.event_type,
                entity_id=block.entity_id,
                event_data=stored_data,
            )

            # Check both previous hash pointer and payload checksum
            if block.previous_hash != prev_hash or block.sha256_checksum != recalculated_hash:
                logger.error(f"Audit chain breach detected at block #{block.block_index} (ID: {block.id})!")
                return {
                    "chain_valid": False,
                    "total_blocks": len(blocks),
                    "genesis_hash": GENESIS_HASH,
                    "latest_hash": prev_hash,
                    "broken_block_id": block.id,
                    "broken_block_index": block.block_index,
                    "expected_hash": recalculated_hash,
                    "stored_hash": block.sha256_checksum,
                    "verification_status": "TAMPER_DETECTED",
                    "verification_timestamp": datetime.now(timezone.utc).isoformat()
                }

            prev_hash = block.sha256_checksum

        return {
            "chain_valid": True,
            "total_blocks": len(blocks),
            "genesis_hash": GENESIS_HASH,
            "latest_hash": prev_hash,
            "broken_block_id": None,
            "verification_status": "CRYPTOGRAPHICALLY_VERIFIED_TAMPER_PROOF",
            "verification_timestamp": datetime.now(timezone.utc).isoformat()
        }


audit_ledger = CryptographicAuditLedger()
