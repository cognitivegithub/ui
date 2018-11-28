/**
 * Базовый класс для вывода нужной части заявки, определяет общие методы для обеих частей
 * @child Application.components.ApplicFirstPartEditTab
 * @child Application.components.ApplicSecondPartEditTab
 *
 * @method getValues : собирает значения по компоненту
 * @method setValues : расставляет значения в поля
 * @method getDocumentFieldset : создает филдсет-контейнер для загрузки документов
 * @method constructDocumentUploadPanel : создает экземпляр Application.components.multiuploadPanel для загрузки документов
 * @method fillDocReqUploadPanel : заполняет список уже загруженных файлов
 * @method getPartNumberHiddenField : создает хидден-поле с номером части заявки
 * @method setDocReqs : подготавливает список требуемых заказчиком документов для создания панелей загрузки
 * @method createCmpDataPanel : создает панель данных о организации и заполняет ее значениями
 *
 */
Application.components.ApplicEditTab = Ext.extend(Ext.form.FormPanel, {
  frame: true,
  border: false,

  getValues: function() {
    var v = {};
    collectComponentValues(this, v,true);
    return v;
  },
  setValues:function(v) {
    setComponentValues(this, v, true);
  },
  getDocumentFieldset : function(docPanelId, docPanelName) {
   var component = this;
   var noneditable = component.noneditable;
   if(noneditable===undefined) noneditable=false;
   var panelName = (docPanelId=='max_sum_docs_fset') ? docPanelName+REQUIRED_FIELD : docPanelName;
   var fset = {
      xtype: 'fieldset',
      title: panelName,
      id: docPanelId,
      items: []
    };
    if(!noneditable) {
       fset.items.push({
          html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                ACCEPTED_FILES+'.',
          cls: 'spaced-bottom-shallow'
        });
     }
     return fset;
  },
  constructDocumentUploadPanel : function(docKeyName, doctype, partNumber, partDocReq) {
    var component = this;
    var reasn = (partDocReq) ? (partDocReq.reason!='')?' (основание: '+partDocReq.reason+')':'' : null;
    var docTitle = (partDocReq) ? partDocReq.requirement+reasn : null;
    var drawFrame = true;
    if(docTitle==null) {
      drawFrame = false;
    }
    var docPanelId = (partDocReq) ? 'doc_req_'+partDocReq.id : docKeyName+'_'+partNumber;
    var cmptype = (component.noneditable) ? 'Application.components.filelistPanel' : 'Application.components.multiuploadPanel';
    var cmpborder = (component.noneditable) ? false : true;
    var panelName = docKeyName;
    if(partDocReq!==undefined)
      panelName=panelName+('-'+partDocReq.id);
    
    var docUploadPanel = {
      xtype: cmptype,
      //name: 'application_docs',
      name: panelName,
      requiredDescr: (partDocReq) ? true : false, // alena 4449
      uploadHandler: RPC.Applic.addFile,
      deleteHandler: RPC.Applic.removeFile,
      hideTitle: true,
      autoUpload: true,
      title: docTitle,
      fdata: partDocReq,
      style: 'margin-top: 5px',
      frame: drawFrame,
      border: true,
      id: docPanelId,
      listeners: {},
      withHash: false
    };
    if(!component.noneditable) {
      docUploadPanel.listeners.beforeupload = function(cmp) {
        var application_id = 0;
        if(component.parent.applic!=null)
          application_id=component.parent.applic.id;
        else if(component.parent.application_id)
          application_id=component.parent.application_id;
        cmp.uploadParams.application_id = application_id;
        if(partDocReq && doctype=='1') {
          cmp.uploadParams.requirement_id = cmp.fdata.id;
        }
        cmp.uploadParams.doctype = doctype;
        cmp.uploadParams.lot_id = component.parent.lot_data.id;
        cmp.uploadParams.application_part = partNumber;
        if (!cmp.uploadParams.application_id) {
          cmp.uploadParams.applicationData = Ext.encode({
            lot_id: cmp.uploadParams.lot_id,
            parts: [component.getValues()]
          });
        }
      };

      docUploadPanel.listeners.uploadcomplete = function(result, action) {
        if (result.success
            && result.application_id
            && result.application_id!=component.parent.application_id)
        {
          component.parent.fireEvent('idchanged', result.application_id);
        }
        if (result.redirect_url) {
          redirect_to(result.redirect_url);
        }
      };

    }
    return docUploadPanel;
  },
  fillDocReqUploadPanel : function(docUploadPanel, application_docs) {
    var docs = [];
    var req_id = docUploadPanel.fdata.id;
    for(var d=0; d<application_docs.length; d++) {
      if(application_docs[d].requirement_id==req_id) {
        docs.push(application_docs[d]);
      }
    }
    if (docs.length>0) {
      docUploadPanel.setValues(docs);
    }
  },
  getPartNumberHiddenField : function (partNumber) {
    return {
      xtype: 'textfield',
      hidden: true,
      name: 'partNumber',
      value: partNumber
    };
  },
  setDocReqs : function (partNumber) {
    var docreqs = this.parent.lot_data.lot_doc_requirements;
    var partDocReqs=[];

    for(var i=0; i<docreqs.length; i++) {
      if(docreqs[i].application_part==partNumber) {
        partDocReqs.push(docreqs[i]);
      }
    }
    return partDocReqs;
  },
  createCmpDataPanel : function(isEdit) {
    var company_data = Main.contragent;
    company_data.phone = Main.user.user_phone;

    var component = this;
    var cmptype = (component.noneditable) ? 'Application.components.cmpDataView' : 'Application.components.cmpDataPanel';
    if (!isSupplier() && !component.noneditable && Main.config.allow_customer_add_applic) {
      company_data = null;
      cmptype = 'Application.components.SupplierInputPanel';
    }

    var cmpPanel = {
      xtype: cmptype,
      cmptype: 'supplier',
      noneditable: component.noneditable,
      editableAddressFields: !isEdit,
      cmpData: company_data,
      lot_id: component.lot_id,
        listeners: {
            "afterContragentSelect": function(cmp, contragentExist) {
                cmp.addressLegal.setDisabled(contragentExist);
                cmp.addressPostal.setDisabled(contragentExist);
            },
            "innChanged": function(cmp) {
                cmp.addressLegal.setDisabled(false);
                cmp.addressPostal.setDisabled(false);
            }
        }
    };

    return cmpPanel;
  }
});
