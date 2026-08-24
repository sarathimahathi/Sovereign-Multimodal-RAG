from typing import Optional
from qdrant_client.http import models as qmodels
from rag.schemas.retrieval import RetrievalFilters

class FilterBuilder:
    @staticmethod
    def build_qdrant_filter(filters: Optional[RetrievalFilters]) -> Optional[qmodels.Filter]:
        if not filters:
            return None
        
        must_conditions = []
        if filters.document_type:
            must_conditions.append(qmodels.FieldCondition(
                key="document_type", match=qmodels.MatchValue(value=filters.document_type)
            ))
        if filters.equipment_type:
            must_conditions.append(qmodels.FieldCondition(
                key="equipment_type", match=qmodels.MatchValue(value=filters.equipment_type)
            ))
        if filters.equipment_id:
            must_conditions.append(qmodels.FieldCondition(
                key="equipment_id", match=qmodels.MatchValue(value=filters.equipment_id)
            ))
        if filters.revision:
            must_conditions.append(qmodels.FieldCondition(
                key="revision", match=qmodels.MatchValue(value=filters.revision)
            ))
        if filters.department:
            must_conditions.append(qmodels.FieldCondition(
                key="department", match=qmodels.MatchValue(value=filters.department)
            ))

        for k, v in filters.custom_filters.items():
            must_conditions.append(qmodels.FieldCondition(
                key=k, match=qmodels.MatchValue(value=v)
            ))

        return qmodels.Filter(must=must_conditions) if must_conditions else None
