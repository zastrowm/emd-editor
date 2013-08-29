
module EMD.Editor.Files {

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

}
