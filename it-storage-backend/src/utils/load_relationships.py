from sqlalchemy import inspect
from sqlalchemy.orm import joinedload


def load_relationships(model,query):
    mapper = inspect(model)
    for rel in mapper.relationships:
        query = query.options(joinedload(getattr(model, rel.key)))
    
    return query