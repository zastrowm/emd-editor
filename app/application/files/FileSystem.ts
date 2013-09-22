///<reference path="Path.ts" />

module Application.Files {

  export interface INamedSystem {
    name: string;
    system: IFileSystem;
  }

  export class FileSystems {
    /**
     * All of the registered file systems
     */
    private static fileSystems: any = {};

    /**
     * Register a file system that can be created by clients
     * @param name the name of the file system to register
     * @param fileSystem the filesystem to be added
     */
    public static register(name: string, fileSystem: IFileSystem) {
      FileSystems.fileSystems[name.toLowerCase()] = fileSystem;
    }

    /**
     * Get the file system associated with the name
     * @param name the name of the file system to retrieve
     */
    public static get(name: string): IFileSystem {
      return FileSystems.fileSystems[name.toLowerCase()];
    }

    /**
     * Return an array of all registered file systems
     * @returns {Array} an array of all registered file systems
     */
    public static allRegistered(): INamedSystem[] {

      var list: INamedSystem[] = [];

      var fss: any = FileSystems.fileSystems;

      Object.keys(fss).forEach(key => {
        list.push({
          name: key,
          system: fss[key]
        });
      })

      return list;
    }
  }

  export enum FileSystemSupport {
    FileRename,
    FileDelete,
    CreateDirectory,
  }

  /**
   * A system in which files from which files can be saved and loaded
   */
  export interface IFileSystem {

    /**
     * Check whether feature is supported
     * @param feature the feature to check for support of
     * @returns true if the feature is supported, false otherwise
     */
    supports(feature: FileSystemSupport): boolean;

    /**
     * Check if a string is a valid filename
     * @param fileName the name of the file to check
     * @returns true if the name is valid, false otherwise
     */
    isValidFilename(fileName: string): boolean;

    /**
     * Get the root directory of the file system
     */
    getRootDirectory(): IDirectory;
  }

  /**
   * A text file from which text can be saved or loaded
   */
  export interface ITextFile {

    /**
     * The name of the file
     */
    name: string;

    /**
     * Save text to the file
     * @param text the content of the file
     */
    save(text: string);

    /**
     * Load the contents of the file
     * @returns the contents of the file
     */
    load(): string;

    /**
     * Rename the file to something els
     * @param name the new name of the file
     * @returns another file that should be used for all future operations
     */
    rename(name: string): ITextFile;

    /**
     * Check if the file already exists
     * @returns true if the file already exists
     */
    exists(): boolean;

    /**
     * Delete the file
     */
    delete();

    /**
     * The metadata associated with the document
     */
    metadata: IFileMetadata;
  }

  /**
   * A collection of files
   */
  export interface IDirectory {

    /**
     * The name of the directory
     */
    name: string;

    /**
     * Get all of the files in the directory
     */
    getFiles(): ITextFile[];

    /**
     * Get all of the directories in the directory
     */
    getDirectories(): IDirectory[];

    /**
     * Gets the file with the designated name
     */
    getFile(name: string): ITextFile
  }

  /**
   * Data describing a document
   */
  export interface IFileMetadata {

    /**
     * The size (in bytes) of the file
     */
    size?: number;

    /**
     * The last time the file was edited
     */
    lastEdited?: Date;
  }

}
