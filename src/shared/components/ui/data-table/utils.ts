export function getDataTableValue<T>(row: T, accessor?: keyof T): unknown {
  return accessor ? row[accessor] : undefined
}
