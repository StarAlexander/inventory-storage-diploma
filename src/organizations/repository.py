from .models import Organization
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
class OrganizationRepository:
    def __init__(self,session:AsyncSession):
        self.session = session
    
    async def get_organization_by_name(self,name:str):
        res = await self.session.execute(select(Organization).filter_by(name=name))
        return res.scalars().first()

    async def create_organization(self,org:Organization):
        self.session.add(org)
        await self.session.commit()
        await self.session.refresh(org)
        print("sldkfj[poi[poi]]")
    