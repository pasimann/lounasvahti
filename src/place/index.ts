export abstract class Place {
  abstract menu (date: Date): Promise<string[]>
}
