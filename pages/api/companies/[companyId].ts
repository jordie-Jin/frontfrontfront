import { mockGetCompanyDetail, simulateLatency } from '../../../src/services/mockApi';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    await simulateLatency();
    const { companyId } = req.query ?? {};
    const data = await mockGetCompanyDetail(String(companyId));
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ message: 'Company not found' });
  }
}
