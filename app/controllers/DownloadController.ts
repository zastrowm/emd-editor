///<reference path="../../def/jquery.d.ts" />

interface JQuery {
  modal(data: any): void;
}

module EMD.Editor {

  /**
   * Controls the download UI
   */
  export class DownloadController {

    private scope: any;

    constructor($scope) {
      this.scope = $scope;

      $scope.$on('download', (evt, data) => this.handleDownload(data));
      $scope.filename = "document";
      $scope.handleAfterDownload = () => this.handleAfterDownload();

      $('#download-document').on('shown', function () {
        $('#download-document input').focus();
      })
    }

    private handleDownload(data: any) {
      this.scope.isHidden = false;
      $('#download-link').attr('href', data.downloadData);

      this.promptDownload(true);
    }

    private handleAfterDownload() {
      this.promptDownload(false);
    }

    private promptDownload(show: boolean){
      var opt = show ? 'show' : 'hide';

      $('#download-document').modal(opt);
    }
  }

}