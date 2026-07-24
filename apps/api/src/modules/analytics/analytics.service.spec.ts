import { aggregateYieldByDepartment } from './analytics.service';

describe('aggregateYieldByDepartment', () => {
  it('combines departments with the same display name without duplicate rows', () => {
    const departments = [
      { id: 'factory-a-polishing', name: 'Polishing' },
      { id: 'factory-b-polishing', name: 'Polishing' },
      { id: 'factory-a-sawing', name: 'Sawing' },
    ];
    const operations = [
      { departmentId: 'factory-a-polishing', yieldPct: 80 },
      { departmentId: 'factory-b-polishing', yieldPct: 100 },
      { departmentId: 'factory-a-sawing', yieldPct: 75 },
    ];

    expect(aggregateYieldByDepartment(departments, operations)).toEqual([
      { department: 'Polishing', yieldPct: 90, operations: 2 },
      { department: 'Sawing', yieldPct: 75, operations: 1 },
    ]);
  });

  it('reports zero yield for departments without analyzed operations', () => {
    expect(
      aggregateYieldByDepartment([{ id: 'rough', name: 'Rough' }], []),
    ).toEqual([{ department: 'Rough', yieldPct: 0, operations: 0 }]);
  });
});
