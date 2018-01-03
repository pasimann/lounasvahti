export abstract class Place {
  name: RegExp
  header: string
  abstract menu (date: Date): Promise<string[]>
}
