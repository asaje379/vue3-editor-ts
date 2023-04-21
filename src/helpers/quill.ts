import Quill from 'quill';

export class ExtendedQuill extends Quill {
  static getHTML(): any {
    return undefined;
  }

  static getWordCount(): number {
    return 0;
  }
}
