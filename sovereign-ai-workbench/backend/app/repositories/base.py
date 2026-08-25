"""
Generic Async Base Repository.
Provides standard CRUD operations decoupled from business services.
"""

from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from ..database.models import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic Repository implementing basic CRUD operations.
    """
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id_val: str) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        result = await self.session.execute(select(self.model).where(self.model.id == id_val))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch records with pagination."""
        query = select(self.model).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self) -> int:
        """Count total records for this entity."""
        result = await self.session.execute(select(func.count(self.model.id)))
        return result.scalar() or 0

    async def create(self, **kwargs: Any) -> ModelType:
        """Create and persist a new model instance."""
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        return instance

    async def delete_by_id(self, id_val: str) -> bool:
        """Delete a record by primary key."""
        result = await self.session.execute(delete(self.model).where(self.model.id == id_val))
        return result.rowcount > 0
