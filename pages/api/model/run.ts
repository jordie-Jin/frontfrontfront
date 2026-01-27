import { mockRunModel, simulateLatency } from '../../../src/services/mockApi';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    await simulateLatency();
    const data = await mockRunModel(req.body ?? {});
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Model run failed' });
  }
}
