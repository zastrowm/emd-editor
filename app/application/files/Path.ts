///<reference path="FilePath.ts" />

module Application.Files {

  /**
   * Filename/path utilities
   */
  export class Path {

    /**
     * Normalize the slashes in a path
     */
    public static normalizeSlashes(path: string): string {
      return path.replace(/\\/g,"/");
    }

    /**
     * Convert a path to a FilePath
     * @param path the path to parse
     * @returns {Application.Files.FilePath}
     */
    public static parseFilePath(path: string) : FilePath {
      if (path == null) {
        return new FilePath(null, null, null);
      }

      var directory = null;
      var extension = null;
      var name = null;

      path = Path.normalizeSlashes(path);

      var indexOfSlash = path.lastIndexOf('/');
      if (indexOfSlash != -1) {
        directory = path.substr(0, indexOfSlash);
        name = path = path.substr(indexOfSlash + 1);
      }

      var indexOfPeriod = path.lastIndexOf('.');
      if (indexOfPeriod != -1) {
        extension = path.substr(indexOfPeriod + 1);
        name = path.substring(0, indexOfPeriod);
      }

      return new FilePath(directory, name, extension);
    }

  }

}