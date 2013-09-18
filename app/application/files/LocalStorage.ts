///<reference path="FileSystem.ts" />

module Application.Files.LocalStorage {

  import fs = Application.Files;

  /**
   * File system impelmentation for local storage
   */
  export class FileSystem implements
      fs.IFileSystem,
      fs.IDirectory {

    /**
     * All key names starting with "file-" are considered to be files
     */
    public static filePrefix = "file-";

    /**
     * The name of the root directory is, '/'
     */
    public name: string = "/";

    /**
     * Constructor
     */
    public constructor() {

    }

    /* Interface Implementation */
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

    /* Interface Implementation */
    isValidFilename(fileName: string): boolean {
      return /^[a-z0-9 \-\._]+$/i.test(fileName);
    }

    /* Interface Implementation */
    getRootDirectory(): fs.IDirectory {
      return this;
    }

    /* Interface Implementation */
    /* Return no other directories */
    getDirectories(): fs.IDirectory[] {
      return [];
    }

    /* Interface Implementation */
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

    /* Interface Implementation */
    getFile(name: string): fs.ITextFile {
      return new TextFile(FileSystem.filePrefix + name);
    }
  }

  /**
   * Local storage text file
   */
  class TextFile implements fs.ITextFile {

    /* Interface Implementation */
    public name: string;

    /* Interface Implementation */
    public metadata: fs.IFileMetadata;

    /**
     * Create a new text file
     * @param key the key associated with the file (the name is derivied by subtracting
     * the common prefix
     */
    constructor(private key: string) {
      this.name = key.substr(FileSystem.filePrefix.length);

      this.metadata = {
        size: this.exists() ? this.load().length : 0,
        lastEdited: new Date()
      };
    }

    /* Interface Implementation */
    save(content: string) {
      localStorage.setItem(this.key, content);
    }

    /* Interface Implementation */
    load(): string {
      return localStorage.getItem(this.key);
    }

    /* Interface Implementation */
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

    /* Interface Implementation */
    exists(): boolean {
      return localStorage.getItem(this.key);
    }

    /* Interface Implementation */
    delete(): void {
      localStorage.removeItem(this.key);
    }
  }

  FileSystems.register("LocalStorage", new FileSystem());

}