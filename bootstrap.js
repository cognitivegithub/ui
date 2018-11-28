
window.BootstrapLoader = {
  errorHandler: function(e, file, line) {
    var img = document.getElementById("splashscreen-loader-image");
    var txt = document.getElementById("splashscreen-loader-text");
    if (img) {
      img.src = '/css/images/default/window/icon-error.gif';
      img.alt = 'Ошибка';
    }
    if (txt) {
      txt.innerHTML = '<p>Произошла ошибка во время загрузки системы.</p>'+
                      '<p>Пожалуйста, <span style="border-bottom: 1px dashed black; cursor: pointer;" onclick="window.location.reload();">попробуйте еще раз</span>.</p>'+
                      '<p>Подробности ошибки: '+e+(file?(' в '+file+(line?(':'+line):'')):'')+'</p>';
    }
    window.BootstrapLoader.loadFailure = true;
  },
  updateTs: (new Date()).getTime(),
  setLoadingFile: function(f, n, total) {
    var now = (new Date()).getTime();
    if (now>this.updateTs+250) {
      f = f.replace(/</g, '&lt;');
      f = f.replace(/^.*\/([^/?]*)(\?.*)?$/g, '$1');
      if (!this.details) {
        this.details = document.getElementById("splashscreen-loader-details");
      }
      if (this.details) {
        this.details.innerHTML = '['+Math.round(100*n/total)+'%] '+f;
      }
      this.updateTs = now;
    }
  },
  splashUpdate: function(text) {
    if (!this.loadFailure) {
      document.getElementById("splashscreen-loader-text").innerHTML = text;
    }
  },
  initErrorHandler: function() {
    this.oldErrorHandler = window.onerror;
    window.onerror = this.errorHandler;
  },
  cleanup: function() {
    document.body.removeChild(document.getElementById("splashscreen-loader"));
    window.onerror = this.oldErrorHandler;
    window.BootstrapLoader = null;
    try {
      delete window.BootstrapLoader;
    } catch (e) {}
  },
  errorCleanup: function() {
    var layout = document.getElementById('layout_center_outer_panel');
    if (layout) {
      document.body.removeChild(layout);
    }
  },
  bootstrap: function() {
    document.getElementById("splashscreen-loader").style.display = 'block';
    this.initErrorHandler();
    this.splashUpdate('Загрузка стилей');
  },
  bootstrapScripts: function() {
    this.splashUpdate('Загрузка системы<div id="splashscreen-loader-details"></div>');
  },
  finalize: function() {
    if (!this.loadFailure) {
      this.cleanup();
      Ext.onReady(Main.init_application);
    } else {
      this.errorCleanup();
    }
  }
};
