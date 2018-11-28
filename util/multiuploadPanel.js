
/**
 * Компонент для загрузки файлов. Загружает файлы по одному.
 * Параметры:
 *
 *   items — дополнительные элементы. Отображаются перед списком файлов.
 *
 *   uploadText — текст кнопки добавления файла
 *
 *   uploadParams — дополнительные параметры, которые необходимо передать
 *   в хендлер
 *
 *   autoUpload — аплоадить сразу при выборе файла, не показывать кнопку аплоада
 *
 *   simultaneousUpload — разрешить аплоад нового файла до окончания загрузки предыдущего
 *
 *   files — массив объектов метаданных о файлах, которые необходимо отобразить
 *   изначально. Метаданные такие:
 *     name — имя файла
 *     descr — описание файла
 *     link — ссылка на файл
 *     size — размер файла
 *
 *   uploadHandler — Direct функция, в которую аплоадить файл (обязательно должна
 *   быть определена с параметром @formHandler). Должна возвращать статус в параме
 *   success, и метаданные файла в параметре file. Эти метаданные хранятся в
 *   компоненте и используются в большинстве операций. Содержимое метаданных
 *   произвольно. Предопределенные проперти, которыми пользуется данный компонент:
 *     name: имя файла,
 *     decr: описание файла,
 *     size: размер файла,
 *     link: ссылка на скачивание файла.
 *   Все проперти опциональны, только крайне желательно наличие name, т.к. иначе
 *   фаллбек выдаст пользователю не особо адекватные данные.
 *
 *   deleteHandler — Direct функция, которая будет вызывана при попытке удалить файл.
 *   Параметром будет передан объект метаданных, который был получен от
 *   uploadHandler.
 *   Если параметр не указывать, то функции удаления не будет.
 *   Функция должна возвращать статус операции параметром success.
 *
 *   withDescr — требовать описание для загружаемых файлов
 *
 *   uploadName — name параметра файлов, по умолчанию file
 *
 *   requiredMark — отображать звездочку обязательного поля (нужно когда валидность
 *   проверяется вне файлового компонента)
 *
 *   maxFiles -- максимально возможно колличесво фалов для загрузки
 *
 * Методы:
 *
 * removeFileInfo(f) — удалить из списка файлов описание, соответствующее файлу f.
 * f — либо объект из deleteHandler или функция, которая возвращает true на
 * нужный компонент. Функции будет передаваться объект из items.
 *
 * addFileInfo(f) — добавить в список информацию о файле.
 *
 * getFilesInfo() — возвращает массив инфы по файлам
 *
 * getValues() — синоним getFilesInfo
 *
 * setValues(v) — заполняет компонент значениями из массива v, массива метаданных
 * файлов.
 *
 * Евенты:
 *   beforeupload(component) [OUT]
 *     стреляет перед аплоадом, парам — сам компонент. Шанс похимичить с
 *     uploadParams. Если вернуть false то аплоад отменится.
 *
 *   uploadcomplete(result, action) [OUT]
 *     стреляет когда юзер загрузил файл. result — результат возврата хендлера,
 *     action — экшн аплоада
 *
 *   deleteComplete(file) [OUT]
 *     стреляет когда файл успешно удален. file — объект файла
 */

Ext.define('Application.components.multiuploadPanel', {
  extend: 'Ext.panel.Panel',
  withDescr: true,
  comboDescr: false,
  withJustification: false,
  files: [],
  uploadText: false,
  uploadParams: {},
  autoUpload: false,
  simultaneousUpload: false,
  uploadHandler: null,
  deleteHandler: null,
  uploadName: 'file',
  docTypeStore: null,
  maxFiles: null,
  uploaded_files_id: null,
  uploaded_files_ep9_id: null,
  disabledUpload: false,
  initComponent: function() {
    var component = this;
    var upload_panel_id = Ext.id();
    this.upload_panel_id = upload_panel_id;
    var fileitems = [];
    this.addEvents('beforeupload');
    this.addEvents('uploadcomplete');
    this.addEvents('deletecomplete');

    for (var i=0; i<this.files.length; i++) {
      fileitems.push(this.getFileInfoPanel(this.files[i]));
    }
    var items = [];
    if (this.items) {
      items.push.apply(items, this.items);
    }
    if (!this.uploadText) {
      this.uploadText = this.autoUpload?'Выбрать и загрузить файл':'Загрузить файл';
    }

    var uploaderConfig = {
      disabled: component.disabledUpload,
      xtype: 'Application.components.UploadFilePanel',
      id: upload_panel_id,
      withDescr: this.withDescr,
      comboDescr: this.comboDescr,
      formLabelWidth: this.formLabelWidth,
      formDescriptionLabel: this.formDescriptionLabel,
      withJustification: this.withJustification,
      docTypeStore: this.docTypeStore,
      allowCancel: false,
      //required: true,
      requiredDescr: component.requiredDescr!==undefined ? component.requiredDescr : true,
      requiredMark: component.requiredMark!==undefined ? component.requiredMark : false,
      required: component.required ? true:false,
      uploadText: this.autoUpload?this.uploadText:'Выбрать файл',
      monitorValid: this.autoUpload,
      listeners: {
        fileselected: function() {
          if (component.autoUpload) {
            uploadFn();
          }
        }
      }
    };

    if (component.uploaded_files_ep9_id == null) {
      component.uploaded_files_ep9_id = Ext.id();

      items.push({
        xtype: 'fieldset',
        title: 'Документы по несостоявшейся конкурентной закупке',
        border: true,
        id: component.uploaded_files_ep9_id,
        items: fileitems,
        hidden: true
      });
    }

    if (component.uploaded_files_id == null) {
      component.uploaded_files_id = Ext.id();

      items.push({
        xtype: 'panel',
        border: false,
        id: component.uploaded_files_id,
        cls: 'shallowsubpanel',
        items: fileitems
      });
    }

    items.push(uploaderConfig);

    var uploadFn = function() {
      var upload = Ext.getCmp(upload_panel_id);
      if (upload.isValid()) {
        if (false===component.fireEvent('beforeupload', component)) {
          return;
        }
        var params = component.uploadParams;
        params.descr = upload.getDescription();
        var documentType = upload.getDocumentType();
        if (documentType) {
          params.document_type = documentType;
        }
        var descrId = upload.getDescrId();
        if (descrId) {
          params.descr = params.descr + '. ' + descrId;
        }
        
        var isJustificationDocument = upload.getIsJustificationDocument();
        params.is_justification_document = isJustificationDocument;
        if(isJustificationDocument){
          params.descr = 'Документ-обоснование отсутствия - ' + params.descr;
        }
        
        var el = {tag: 'div', style:"visibility: hidden; display:none;"};
        el = Ext.DomHelper.append(Ext.getBody(), el);
        var input = Ext.get(upload.getFilePanel().getFileInputId()).dom;
        /*var input = old_input.cloneNode(true);*/
        input.setAttribute('name', component.uploadName);
        /*input.setAttribute('id', Ext.id());
        if (!input.value) {
          input.setAttribute('value', old_input.value);
        }*/
        function clean() {
          upload.getEl().unmask();
          Main.app.un('rpcerror', clean);
          form.destroy();
          Ext.fly(el).remove();
          if (component.simultaneousUpload) {
            component.remove(upload);
            component.doLayout();
          } else {
            upload.reset();
          }
        }
        var form = new Ext.form.FormPanel({
          renderTo: el,
          api: {
            submit: component.uploadHandler
          },
          baseParams: params,
          paramsAsHash: true,
          fileUpload: true,
          hidden: true,
          items: [{contentEl: input}],
          listeners: {
            actioncomplete: function(form, action) {
              if (action && action.result ) {
                if (action.result.success) {
                  if(!component.hideFileList) {
                    component.addFileInfo(action.result.file);
                  }
                } else {
                  echoResponseMessage(action.result);
                }
              }
              component.fireEvent('uploadcomplete', action.result, action);
              clean();
            },
            actionfailed: function(form, action) {
              clean();
              if (action && action.result) {
                echoResponseMessage(action.result);
              }
            }
          }
        });
        Main.app.on('rpcerror', clean);
        upload.getEl().mask('Загрузка файла', 'x-mask-loading');
        form.getForm().submit();
        if (component.simultaneousUpload) {
          upload_panel_id = Ext.id();
          component.upload_panel_id = upload_panel_id;
          uploaderConfig.id = upload_panel_id;
          uploaderConfig.docTypeStore = this.docTypeStore;
          component.add(uploaderConfig);
          component.doLayout();
        }
      }
    };
    var buttons = null;
    if (!this.autoUpload) {
      buttons = [{
        xtype: 'button',
        text: this.uploadText,
        handler: uploadFn
      }];
    }
    Ext.apply(this, {
      items: items,
      buttons: buttons,
      addFileInfo: function(file) {
        var panel = Ext.getCmp(component.uploaded_files_id);
        var panel_ep9 = Ext.getCmp(component.uploaded_files_ep9_id);
        if (file.document_type == VOCAB_DOC_TYPE_EP9_DOC_ID) {
          if (file.actual) {
            panel_ep9.add(this.getFileInfoPanel(file));
            panel_ep9.show();
          }
        } else {
          panel.add(this.getFileInfoPanel(file));
          component.hideFilePanelIfBig(panel);
        }
        panel_ep9.doLayout();
        this.fireEvent('addfilecomplete', file);
      },
      getFilesInfo: function() {
        var info = [];
        var panel = Ext.getCmp(component.uploaded_files_id);
        panel.items.each(function(i){
          if (i.file) {
            info.push(i.file);
          }
        });
        return info;
      },
      removeFileInfo: function(f, panel) {
        if(!panel) {
          panel = Ext.getCmp(component.uploaded_files_id);
        } else if (typeof panel == 'string' && panel.length > 0) {
          panel = Ext.getCmp(panel);
        } else {
          return;
        }
        panel.items.each(function(i){
          var result = false;
          if (Ext.isFunction(f)) {
            result = f(i.file);
          } else {
            result = (i.file === f)
          }
          if (result) {
            panel.remove(i);
            component.hideFilePanelIfBig();
            //return false;
          }
          //return true;
        }, this);
      },
      updateFileInfo: function(f) {
        var panel = Ext.getCmp(component.uploaded_files_id);
        panel.items.each(function(i){
          var result = false;
          if (Ext.isFunction(f)) {
            result = f(i.file);
          } else {
            result = (i.file === f)
          }
          if (result) {
            if (i.file) {
              i.file.actual = false;
              i.file.obsolete = true;
              i.update(getFileInfoHtml(i.file));
            }
            component.hideFilePanelIfBig(panel);
          }
        }, this);
      },
      hideFilePanelIfBig: function (panel){
        if(!panel) {
          panel = Ext.getCmp(component.uploaded_files_id);
        }
        if (this.maxFiles) {
          if (panel.items.getCount() >= this.maxFiles) {
            Ext.getCmp(upload_panel_id).hide();
          } else {
            Ext.getCmp(upload_panel_id).show();
          }
        }
        panel.doLayout();
      },
      deleteFile: function(f) {
        var cmp = this;
        var onDelete = function(r) {
          if (r.success) {
            cmp.updateFileInfo(f);
            cmp.fireEvent('deletecomplete', f);
          } else {
            echoResponseMessage(r);
          }
        }
        if (this.deleteHandler) {
          this.deleteHandler(f, onDelete);
        } else {
          onDelete({success: true})
        }
      },
      removeAllInfo: function() {
        this.removeFileInfo(function(){return true;});
        this.removeFileInfo(function () {return true;}, component.uploaded_files_ep9_id);
      }
    });
    Application.components.multiuploadPanel.superclass.initComponent.call(this);
  },
  getFileInfoPanel: function(file) {
    return getFileInfoPanel(file, {deleteHandler: this.deleteHandler?this.deleteFile.createDelegate(this):false}, false);
  },
  getFileInfoHtml: getFileInfoHtml,
  setValues: function(v) {
    if (!v) {
      return;
    }
    this.removeAllInfo();
    v.sort(function(a, b){
      return parseDate(a.date_added) > parseDate(b.date_added) ? 1 : -1;
    });
    for (var i=0; i<v.length; i++) {
      this.addFileInfo(v[i])
    }

    this.fireEvent('valuessetted');
  },
  reset: function() {
    this.removeAllInfo();
  },
  getValues: function() {
    return this.getFilesInfo();
  },

  updateByDocTypeStore: function (docTypeStore) {
    this.docTypeStore = docTypeStore;
    var upload = Ext.getCmp(this.upload_panel_id);
    upload.updateByDocTypeStore(docTypeStore);
  }
});
