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
    public static filePrefix = "file/";

    /**
     * All key names starting with "meta-" are considered to be metadata
     */
    public static metaPrefix = "meta/";

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
        if (key.indexOf(FileSystem.metaPrefix) == 0) {
          var name = key.substr(FileSystem.metaPrefix.length);
          files.push(new TextFile(name));
        }
      }

      return files;
    }

    /* Interface Implementation */
    getFile(name: string): fs.ITextFile {
      return new TextFile(name);
    }
  }

  /**
   * Local storage text file
   */
  class TextFile implements fs.ITextFile {

    /* Interface Implementation */
    public metadata: fs.IFileMetadata;

    /**
     * Create a new text file
     * @param key the key associated with the file (the name is derived by subtracting
     * the common prefix
     */
    constructor(public name: string) {

      if (this.exists()) {
        var metadata = JSON.parse(localStorage.getItem(this.keyMeta()));
        metadata.lastEdited = new Date(Date.parse(metadata.lastEdited));
        this.metadata = metadata;

      } else {
        this.metadata = {};
      }
    }

    /* Interface Implementation */
    save(content: string) {

      var metadata = JSON.stringify({
        size: content.length,
        lastEdited: new Date()
      });

      localStorage.setItem(this.keyFile(), content);
      localStorage.setItem(this.keyMeta(), metadata);
    }

    /* Interface Implementation */
    load(): string {
      return localStorage.getItem(this.keyFile());
    }

    /* Interface Implementation */
    rename(name: string): fs.ITextFile {
      var otherFile = new TextFile(name);
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
      return localStorage.getItem(this.keyMeta());
    }

    /* Interface Implementation */
    delete(): void {
      localStorage.removeItem(this.keyFile());
      localStorage.removeItem(this.keyMeta());
    }

    private keyFile(): string {
      return FileSystem.filePrefix + this.name;
    }

    private keyMeta(): string {
      return FileSystem.metaPrefix + this.name;
    }
  }

  FileSystems.register("LocalStorage", new FileSystem());

}