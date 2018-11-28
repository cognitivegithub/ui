/**
 * Компонент для загрузки файла с описанием
 *
 * Параметры:
 *
 *   withDescr — добавлять ли поле описания (bool, дефолт false)
 *   withJustification — добавлять ли поле Добавить отсутствующий документ (bool, дефолт false)
 *   fieldName — name инпута файлов (строка, по дефолту не ставится)
 *   descrName — name инпута описания (строка, по дефолту fieldName+'_descr',
 *   если есть fieldName, иначе не ставится)
 *   allowBlank — допускается ли пустой ввод,
 *   uploadText — текст кнопки загрузки
 *   allowCancel — отображать ли кнопку «отмена» (по этой кнопке компонент
 *   самоудаляется)
 *   monitorValid — контролировать валидность текстового инпута, и енаблить кнопку
 *   аплоада только при валидном значении инпута
 *   requiredMark — отображать звездочку обязательного поля (нужно когда валидность
 *   проверяется на сервере)
 *   formLabelWidth — Ширина label в форме загрузки документа
 *   formDescriptionLabel — Название для поля описания.
 *
 * Методы:
 *   isValid() — возвращает true или false в зависимости от валидности компонента
 *   getDescription() — возвращает строку описания из инпута
 *   reset() — сбрасывает компонент в исходное состояние
 *
 * Евенты:
 *   fileselected [OUT] — выбран файл
 *
 */

Application.components.UploadFilePanel = Ext.extend(Ext.Panel, {
  allowCancel: true,
  maxUploadSize: MAX_UPLOAD_SIZE,
  required: false,
  requiredDescr: false,
  uploadText: 'Обзор',
  docTypeStore: null,
  formLabelWidth: false,
  formDescriptionLabel: false,

  withJustification: false,

  initComponent: function() {
    /*
     * parameter list:
     * this.withDescr
     * this.required
     * this.fieldname
     * this.allowCancel
     * this.descrName
     */
    var component = this;
    
    if (this.fieldName) {
      this.fieldname = this.fieldName;
    }
    if (undefined !== this.allowBlank) {
      this.required = !this.allowBlank;
    }
    if (this.fieldname && !this.descrName) {
      this.descrName = this.fieldname + '_descr';
    }
    if (!this.withDescr || this.allowBlank) {
      this.monitorValid = false;
    }
    this.addEvents('fileselected');


    var monitorValidFn = function(valid) {
      if (!component.monitorValid) {
        return;
      }
      var uploader = Ext.getCmp(component.uploadPanelId);
      if (valid) {
        uploader.enable();
      } else {
        uploader.disable();
      }
    };

    var items = [];
    if (this.withJustification) {
      this.isJustificationDocument = Ext.id();
      items.push({
        layout: 'form',
        border: false,
        hideTitle: true,
        labelWidth: component.formLabelWidth || 140,
        items: [
          {
            xtype: 'checkbox',
            fieldLabel: 'Добавить отсутствующий документ',
            name: 'is_C_document',
            id: this.isJustificationDocument,
            labelStyle: 'width:210px;',
            listeners: {
              check: function (combo, checked) {
                if (checked) {
                  if (component.descrPanelId){
                    Ext.getCmp(component.descrPanelId).label.update('<b>Отсутствует документ</b>');
                  }
                  if (component.uploadPanelId) {
                    Ext.getCmp(component.uploadPanelId).label.update('<b>Документ-обоснование отсутствия</b>');
                  }
                } else {
                  if (component.descrPanelId){
                    Ext.getCmp(component.descrPanelId).label.update('Файл:');
                  }
                  if (component.uploadPanelId) {
                    Ext.getCmp(component.uploadPanelId).label.update('Путь к файлу:');
                  }
                }
              },
              afterrender: function () {
              }
            }
          }
        ]
      });
    }
    if (this.withDescr && this.comboDescr) {
        this.descrPanelId = Ext.id();
        this.descrPanelContainerId = Ext.id();
        this.descrId = Ext.id();
        this.isJustificationDocument = Ext.id();
        items.push({
        layout: 'form',
        border: false,
        hideTitle: true,
        labelWidth: component.formLabelWidth || 140,
        items: [
          {
          xtype: 'combo',
          store: this.docTypeStore ? this.docTypeStore : Application.models.Procedure.getDocTypesStoreFromRPC(),
          displayField: 'name',
          valueField: 'name',
          editable: false,
          triggerAction: 'all',
          anchor: '100%',
          id: this.descrPanelId,
          fieldLabel: 'Файл'+((component.required || component.requiredMark)?REQUIRED_FIELD:''),
          allowBlank: !component.required && !component.requiredDescr,
          name: this.descrName,
          listeners : {
            valid: function() {monitorValidFn(true)},
            invalid: function() {monitorValidFn(false)},
            select: function(combo, record, index) {
              var value = this.getValue();
              var tempId = Ext.getCmp(component.descrId);
              if(value == 'Не определено' || value == 'Другой документ') {
                    tempId.setDisabled(false);
                    tempId.setVisible(true);
                }
                else {
                    tempId.setDisabled(true);
                    tempId.setVisible(false);
                }
              component.document_type.setValue(record.id);
            }
          }
        }, {
          xtype: 'hidden',
          ref: '../document_type',
          name: 'document_type',
          value: null
        }, {
            xtype: 'textfield',
            anchor: '100%',
            disabled: false,
            hidden: true,
            id: this.descrId,
            fieldLabel: (component.formDescriptionLabel || 'Описание документа') + REQUIRED_FIELD,
            width: '98.6%',
            listeners : {
            valid: function() {monitorValidFn(true)},
            invalid: function() {monitorValidFn(false)}
          }
        }]
      });
    }
    else if (this.withDescr) {
      this.descrPanelId = Ext.id();
      items.push({
        layout: 'form',
        border: false,
        hideTitle: true,
        labelWidth: component.formLabelWidth || 140,
        items: [{
          xtype: 'textfield',
          anchor: '100%',
          id: this.descrPanelId,
          fieldLabel: (component.formDescriptionLabel || 'Описание документа')
            + ((component.required || component.requiredMark) ? REQUIRED_FIELD : ''),
          allowBlank: !component.required && !component.requiredDescr,
          name: this.descrName,
          maxLength: 500,
          listeners : {
            valid: function() {monitorValidFn(true)},
            invalid: function() {monitorValidFn(false)}
          }
        }]
      });
    }
    

    this.uploadPanelId = Ext.id();
    items.push({
      layout: 'column',
      border: false,
      items: [{
        columnWidth: 1,
        xtype: 'panel',
        layout: 'form',
        border: false,
        hideTitle: true,
        labelWidth: component.formLabelWidth || 140,
        items: [{
          xtype: 'fileuploadfield',
          id: this.uploadPanelId,
          fieldLabel: 'Путь к файлу'+((component.required || component.requiredMark)?REQUIRED_FIELD:''),
          name: component.fieldname?component.fieldname:undefined,
          border: false,
          allowBlank: !component.required,
          buttonText: this.uploadText,
          width: '100%',
          disabled: this.monitorValid,
          listeners: {
            fileselected: function() {
              if (this.checkFile()) {
                component.fireEvent('fileselected');
              }
            }
          },
          checkFile: function(){
            var id = this.getFileInputId();
            var input = document.getElementById(id);
            var size;
            if (input && input.files && input.files[0]) {
              size = input.files[0].size;
            } else if (input && window.ActiveXObject) {
              try {
                var myFSO = new ActiveXObject("Scripting.FileSystemObject");
                if (myFSO) {
                  var filepath = input.value;
                  var thefile = myFSO.getFile(filepath);
                  size = thefile.size;
                }
              } catch (e) {
                size = undefined;
              }
            }
            if (size>((Main.config.max_file_size!=undefined) ? (1024*1024*Main.config.max_file_size): MAX_UPLOAD_SIZE)) {
              Ext.Msg.alert('Ошибка', 'Размер файла '+Ext.util.Format.humanizeSize(size)+', '+
                'это больше допустимого (принимаются файлы размером до '+
                ((Main.config.max_file_size!=undefined) ? (Main.config.max_file_size+'Мб'): Ext.util.Format.humanizeSize(MAX_UPLOAD_SIZE))+')'
              );
              //$('#'+id).val(null);
              this.reset();
              return false;
            }
            return true;
          }
        }]
      }]
    });
    if (this.allowCancel) {
      items[items.length-1].items.push({
        xtype: 'button',
        cls: 'upload_field_buttons_margin',
        text: 'Удалить документ',
        handler: function() {
          component.destroy();
        }
      });
    }
    Ext.apply(this, {
      hideTitle: true,
      border: false,
      items: items
    });
    Application.components.UploadFilePanel.superclass.initComponent.call(this);
  },
  reset: function() {
    var d = this.getDescrPanel();
    if (d) {
      d.reset();
    }
    var uploader = this.getFilePanel();
    uploader.reset();
    if (this.monitorValid) {
      uploader.disable();
    }
    //Ext.ux.form.FileUploadField.superclass.reset.call(this);
  },
  getDescrPanel: function() {
    if (this.descrPanelId) {
      var tempCmp = Ext.getCmp(this.descrPanelId);
      if (tempCmp.getValue() == 'Не определено'&&this.comboDescr) {
          return Ext.getCmp(this.descrId);
      }
      else {
          return tempCmp;
      }
    }
    return null;
  },
  getFilePanel: function() {
    return Ext.getCmp(this.uploadPanelId);
  },
  getDescription: function() {
    var descr = this.getDescrPanel();
    return descr?descr.getValue():'';
  },
  getDescrId: function() {
    var tempCmp = Ext.getCmp(this.descrId);
    return tempCmp?tempCmp.getValue():'';
  },
  getIsJustificationDocument: function() {
    var tempCmp = Ext.getCmp(this.isJustificationDocument);
    return tempCmp?tempCmp.getValue():false;
  },
  getDocumentType: function() {
    if (this.document_type) {
      return this.document_type.getValue();
    }
    return null;
  },
  isValid: function() {
    var descr = this.getDescrPanel();
    var valid = true;
    if (descr) {
      valid = descr.isValid();
    }
    var upload = Ext.getCmp(this.uploadPanelId);
    if (!upload.isValid()) {
      // проверяем так, чтобы если что — подчеркнуть красным оба поля
      valid = false;
    }
    return valid;
  },
  isFileAttached: function() {
    var upload = Ext.getCmp(this.uploadPanelId);
    if (!upload) {
      return false;
    }
    var id = upload.getFileInputId();
    var input = document.getElementById(id);
    if (input && (input.value || (input.files && input.files[0])) ){
      return true;
    }
    return false;
  },

  updateByDocTypeStore: function (docTypeStore) {
    var combo = Ext.getCmp(this.descrPanelId);
    combo.bindStore(docTypeStore);
  },

  /**
   * Имя загруженного файла
   * */
  getFileName: function() {
    var upload = Ext.getCmp(this.uploadPanelId);
    if (!upload) {
      return false;
    }
    var id = upload.getFileInputId();
    var input = document.getElementById(id);
    if (input && (input.value || (input.files && input.files[0])) ){
      if (!Ext.isEmpty(input.files)) {
        return input.files[0].name;
      }
      var filename = input.value.replace(/^.*[\\\/]/, '')
      return filename;
    }
    return false;
  }
});
