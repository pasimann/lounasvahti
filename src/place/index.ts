export abstract class Place {
  header: string
  abstract menu (date: Date): Promise<string[]>
}
