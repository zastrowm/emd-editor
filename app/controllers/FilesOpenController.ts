///<reference path="zController.ts" />
///<reference path="../application/files/FileSystem.ts" />

module EmbeddedMarkdown.Editor {

  import fs = Application.Files;

  /**
   * Handles the user opening a file
   */
  export class FilesOpenController extends Controller {

    public files: fs.ITextFile[] = [];
    public currentFile: fs.ITextFile;

    /**
     * The path to the current location
     */
    public path: string[];

    constructor($scope) {
      super($scope)

      var allFiles = fs.FileSystems.allRegistered()[0].system.getRootDirectory().getFiles();
      this.files = allFiles;
      this.path = ["$browser", "/"]
    }

    public onClick(file: fs.ITextFile) {
      this.currentFile = file;
    }

    public onOkay() {
      alert('leaving');
    }

    public isToday(date: Date): boolean {

      if (date == null)
        return false;

      var today = new Date();
      return today.getDate() == date.getDate()
          && today.getMonth() == date.getMonth()
          && today.getFullYear() == date.getFullYear();
    }

    public formatFileSize(num: number): string {

      if (num == null)
        return "-";

      if (num < 1024) {
        return this.format(num, "b");
      } else if (num < 1024 * 1024) {
        return this.format(num/ (1024), "kb");
      } else {
        return this.format(num / (1024 * 1024), "mb");
      }
    }

    public navigate(index: number) {
    }

    private format(num: number, postfix: string) {
      return (Math.round(num * 10) / 10) + " " + postfix;
    }

  }

}
