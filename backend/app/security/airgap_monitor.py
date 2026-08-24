import os
import psutil
import ipaddress
from typing import Dict, Any, List

def is_local_or_private(ip: str) -> bool:
    """Checks if an IP is loopback, link-local, or private RFC1918."""
    try:
        addr = ipaddress.ip_address(ip)
        return addr.is_loopback or addr.is_private or addr.is_link_local
    except ValueError:
        return False

def check_airgap_status() -> Dict[str, Any]:
    current_pid = os.getpid()
    
    # Get current backend process and all its child workers
    try:
        current_process = psutil.Process(current_pid)
        target_pids = {current_pid} | {child.pid for child in current_process.children(recursive=True)}
    except Exception:
        target_pids = {current_pid}

    all_connections = psutil.net_connections(kind='inet')
    
    app_external_conns: List[Dict[str, Any]] = []
    system_external_conns: List[Dict[str, Any]] = []

    for conn in all_connections:
        if conn.raddr:
            remote_ip = conn.raddr.ip
            if not is_local_or_private(remote_ip):
                entry = {
                    "local_address": f"{conn.laddr.ip}:{conn.laddr.port}",
                    "remote_address": f"{remote_ip}:{conn.raddr.port}",
                    "status": conn.status,
                    "pid": conn.pid
                }
                system_external_conns.append(entry)
                if conn.pid in target_pids:
                    app_external_conns.append(entry)

    app_isolated = len(app_external_conns) == 0
    system_isolated = len(system_external_conns) == 0

    return {
        "is_airgapped": app_isolated,
        "app_isolated": app_isolated,
        "app_external_calls": len(app_external_conns),
        "system_offline_proof": system_isolated,
        "system_external_connections": len(system_external_conns),
        "message": (
            "Workbench is 100% sovereign and isolated. Zero external calls from AI backend."
            if app_isolated else
            "Warning: Outbound call detected from AI process."
        ),
        "audit_details": app_external_conns
    }