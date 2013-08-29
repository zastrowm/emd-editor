///<reference path="Filesystem.ts" />


module EMD.Editor.Files.LocalStorage {

  import fs = EMD.Editor.Files;

  export class FileSystem implements
      fs.IFileSystem,
      fs.IDirectory {

    public static filePrefix = "file-";

    public name: string = "/";

    /**
     * Constructor
     */
    public constructor() {

    }

    supports(feature: fs.FileSystemSupport) {
      switch (feature) {
        case fs.FileSystemSupport.CreateDirectory:
          return false;
        case fs.FileSystemSupport.FileDelete:
          return true;
        case fs.FileSystemSupport.FileRename:
          return true;
        default:
          return false;
      }
    }

    isValidFilename(fileName: string): boolean {
      return /^[a-z0-9 \-\._]+$/i.test(fileName);
    }

    getRootDirectory(): fs.IDirectory {
      return this;
    }

    /**
     * No other directories
     */
    getDirectories(): fs.IDirectory[] {
      return [];
    }

    getFiles(): fs.ITextFile[] {

      var files: fs.ITextFile[] = [];

      for (var i = 0; i < localStorage.length; i++){
        var key = localStorage.key(i);
        if (key.indexOf(FileSystem.filePrefix) == 0) {
          files.push(new TextFile(key));
        }
      }

      return files;
    }

    getFile(name: string): fs.ITextFile {
      return new TextFile(FileSystem.filePrefix + name);
    }

  }

  class TextFile implements fs.ITextFile {

    /**
     * The name of the file
     */
    public name: string;

    constructor(private key: string) {
      this.name = key.substr(FileSystem.filePrefix.length);
    }

    save(content: string) {
      localStorage.setItem(this.key, content);
    }

    load(): string {
      return localStorage.getItem(this.key);
    }

    rename(name: string): fs.ITextFile {
      var otherFile = new TextFile(FileSystem.filePrefix + name);
      if (otherFile.exists()) {
        throw new Error("Cannot override file!");
      }

      var content = this.load();
      otherFile.save(content);
      this.delete();

      return otherFile;
    }

    exists(): boolean {
      return localStorage.getItem(this.key);
    }

    delete(): void {
      localStorage.removeItem(this.key);
    }
  }


}