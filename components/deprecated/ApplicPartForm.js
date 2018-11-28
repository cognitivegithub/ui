/**
 * @DEPRECATED
 * Компонент выводит нужную часть заявки на участие в процедуре.
 *
 * Параметры: partNumber - номер части заявки
 *            procedure_data - данные о процедуре
 *            applic - сохраненные прежде данные заявки
 */
Application.components.ApplicPartForm = Ext.extend(Ext.Panel, {
  frame: true,
  border: false,
  initComponent : function () {
    var component = this;

    var docreqs = component.lot_data.lot_doc_requirements;
    component.partDocReqs=[];
    component.application_text = 'Текст заявки тут';
    if(component.partNumber===1) {
      var units = component.lot_data.lot_units;
      var paramPanelId = Ext.id();
    }
    var docPanelId = Ext.id();

    for(var i=0; i<docreqs.length; i++) {
      if(docreqs[i].application_part==component.partNumber) {
        component.partDocReqs.push(docreqs[i]);
      }
    }
    var partName = ((component.partNumber===1) ? 'Первая' : 'Вторая')+' часть заявки';
    var docPanelName = 'Документы, затребованные организатором процедуры закупки '+((component.partNumber===1) ? 'в первой' : 'во второй')+' части заявки на участие';

    Ext.apply(this,
      {
        xtype: 'panel',
        name: 'parts[]',
        layout : 'form',
        labelWidth: 400,
        defaults: {
          allowBlank: false,
          minLengthText: 'Слишком короткое значение',
          maxLengthText: 'Слишком длинное значение',
          anchor: '100%',
          style: 'margin: 5px'
        },
        monitorValid : true,
        title: partName,
        autoHeight: true,
        items: [
        {
          xtype: 'textfield',
          hidden: true,
          name: 'partNumber',
          value: component.partNumber
        },
        {
          xtype: 'fieldset',
          title: docPanelName,
          id: docPanelId,
          hidden: (component.partDocReqs.length===0),
          items: [
            {
              html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                    'Принимаются файлы размером до '+Ext.util.Format.humanizeSize(MAX_UPLOAD_SIZE)+'.'
            }
          ]
        }, {
          xtype: 'fieldset',
          title: 'Иные документы',
          items: [
            {
              html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                    ACCEPTED_FILES
            },
            {
              xtype: 'Application.components.multiuploadPanel',
              uploadHandler: RPC.Applic.addFile,
              deleteHandler: RPC.Applic.removeFile,
              hideTitle: true,
              autoUpload: true,
              simultaneousUpload: true,
              name: 'application_docs_other',
              listeners: {
                beforeupload: function(cmp) {
                  var application_id = 0;
                  if(component.parent.applic!==null)
                    application_id=component.parent.applic.id;
                  else if(component.parent.application_id)
                    application_id=component.parent.application_id;
                  cmp.uploadParams.application_id = application_id;
                  cmp.uploadParams.requirement_id = 0;
                  cmp.uploadParams.lot_id = component.lot_data.id;
                  cmp.uploadParams.doctype = APPLIC_DOC_OTHER;
                  cmp.uploadParams.application_part = component.partNumber;
                },
                uploadcomplete: function(result, action) {
                  if (result.success
                      && result.application_id
                      && result.application_id!=component.parent.application_id)
                  {
                    component.parent.fireEvent('idchanged', result.application_id);
                  }
                },
                afterrender: function() {
                  var cmp = this;
                  if(component.appl_data && component.appl_data.application_docs_other!==null) {
                    cmp.setValues(component.appl_data.application_docs_other);
                  }
                }
              }
            }
          ]
        }
      ],
      listeners: {
        beforerender: function() {
          if(component.partNumber===1) {
             var applicTextCnt = {
              xtype: 'textarea',
              value: getApplicText(),
              anchor: '100%',
              fieldLabel: 'Согласие на поставку, приобретение товаров, выполнение работ, оказание услуг',
              style: 'height: 180px;',
              readOnly: true,
              name: 'application_text',
              hideLabel: true
             };
             var priceField = {
               xtype: 'textfield',
               name: 'price',
               fieldLabel: 'Цена предложения в валюте начальной цены договора',
               value: (component.appl_data)? component.appl_data.price:'',
               hidden: (component.procedure_type!=PROCEDURE_TYPE_AUC_ASC && component.procedure_type!=PROCEDURE_TYPE_AUC_DESC) ? false:true
             };
             component.insert(0,{style: 'margin: 5px 5px 12px;',anchor: '100%', layout: 'anchor', frame: false, border: false, items: [applicTextCnt]});
             component.insert(1,{style: 'margin: 5px;',defaults: {anchor: '100%'}, layout: 'form', labelWidth: 400, frame: false, border: false, items: [priceField]});
             if(units.length>0) {
              for(var i=0; i<units.length; i++) {
                var reqs = units[i].requirements||[];
                var application_trademark = (component.appl_data)? component.appl_data.application_units[i].trademark : false;
                var trademark = (application_trademark) ? application_trademark : units[i].trademark;
                var paramCnt = {
                  xtype: 'fieldset',
                  title: 'Показатели поставляемого товара',
                  id: paramPanelId,
                  name: 'application_units[]',
                  labelWidth: 300,
                  defaults: {
                    anchor: '100%'
                  },
                  items:[
                    {
                      xtype: 'textfield',
                      name: 'name',
                      value: units[i].name,
                      style: 'background: transparent; border: none;',
                      fieldLabel: 'Наименоваие товара'
                    },
                    {
                      xtype: 'textfield',
                      name: 'trademark',
                      value: trademark,
                      fieldLabel: 'Торговая марка поставляемого товара'
                    }, {
                      xtype: 'textfield',
                      name: 'price',
                      fieldLabel: 'Цена в валюте начальной цены лота',
                      value: (component.applic_data)? component.appl_data.application_units[i].price : units[i].price,
                      hidden: !component.lot_data.single_unit
                    }
                  ],
                  unit_id: units[i].id,
                  application_unit_id: (component.appl_data)? component.appl_data.application_units[i].id :null,
                  getValues: function() {
                    var v = {unit_id : this.unit_id};
                    if(this.application_unit_id!==null) {
                      v.id = this.application_unit_id;
                    }
                    collectComponentValues(this, v,true);
                    return v;
                  }
                };
                if(reqs.length>0) {
                  var applic_unit_params = (component.appl_data) ? component.appl_data.application_units[i].application_unit_params : null;
                  var paramPanel = {

                    hideTitle: true,

                    defaults: {
                      layout: 'form',
                      labelWidth: 300,
                      allowBlank: false,
                      anchor: '100%'
                    },
                    items: []
                  };

                  for(var n=0; n<reqs.length; n++) {
                    var eachParam = {
                      xtype: 'panel',
                      name: 'application_unit_params[]',
                      defaults: {
                        allowBlank: false,
                        anchor: '100%'
                      },
                      items:[
                        {
                          xtype: 'hidden',
                          name: 'id',
                          value: (applic_unit_params!==null && applic_unit_params[n]) ? applic_unit_params[n].id : null
                        },
                        {
                          xtype: 'hidden',
                          name: 'param_id',
                          value: reqs[n].id
                        },
                        {
                          xtype: 'textfield',
                          fieldLabel: reqs[n].requirement+' ('+reqs[n].type_vocab+')',
                          name: 'value',
                          value: (applic_unit_params!==null && applic_unit_params[n]) ? applic_unit_params[n].value : (reqs[n].value||''),
                          readOnly: (reqs[n].type=='EXACT')?true:false
                        }
                      ],
                      getValues: function() {
                        var v = {};
                        collectComponentValues(this, v,true);
                        return v;
                      },
                      setValues:function(v) {
                        setComponentValues(this, v, true);
                      }
                    };
                    paramPanel.items.push(eachParam);

                  }
                  paramCnt.items.push(paramPanel);
                }
                component.insert(2,paramCnt);
              }
            }
          }

          if(component.partNumber===2 || component.totalParts==1) {
            var company_data = Main.contragent;

            if(component.appl_data && component.appl_data.phone) {
              company_data.phone = component.appl_data.phone
            }
            var contragent_accreds = company_data.supplier_accreditations;
            var max_sum_doc_needed = false;
            if(contragent_accreds.length>0) {
             var profile_id = contragent_accreds[0].profile_id;
             if((profile_id==SUPPLIER_TYPE_UR_RF || profile_id==SUPPLIER_TYPE_UR_FOREIGN)
               && (Main.user.max_sum==null || Main.user.max_sum=='')) {
               max_sum_doc_needed=true;
             }
            }
            var cmpPanel = {
              xtype: 'Application.components.cmpDataPanel',
              noneditable: false,
              cmpData: company_data
            };
            if(max_sum_doc_needed) {
              var maxSumDocUploadPanel = {
                xtype: 'fieldset',
                title: 'Решение об одобрении или совершении крупной сделки',
                items:  [
                {
                  html: 'Решение об одобрении или совершении крупной сделки либо копия такого решения в случае, если требование о необходимости наличия такого решения для совершения крупной сделки установлено законодательством РФ и (или) учрелительными документами юридического лица и если для участника процедуры закупки поставки товаров, выполнения работ, оказания услуг, являющихся предметом договора, или внесение денежных средств в качестве обеспечения заявки на участие в процедуре, обеспечения исполнения договора являются крупной сделкой'
                }, {
                  xtype: 'Application.components.multiuploadPanel',
                  name: 'max_sum_docs',
                  hideTitle: true,
                  uploadHandler: RPC.Applic.addFile,
                  deleteHandler: RPC.Applic.removeFile,
                  listeners: {
                    beforeupload: function(cmp) {
                      var application_id = 0;
                      if(component.parent.applic!=null)
                        application_id=component.parent.applic.id;
                      else if(component.parent.application_id)
                        application_id=component.parent.application_id;
                      cmp.uploadParams.application_id = application_id;
                      cmp.uploadParams.lot_id = component.lot_data.id;
                      cmp.uploadParams.doctype = APPLIC_DOC_MAXSUM;
                      cmp.uploadParams.requirement_id = 0;
                      cmp.uploadParams.application_part = component.partNumber;
                    },
                    uploadcomplete: function(result, action) {
                      if (result.success
                          && result.application_id
                          && result.application_id!=component.parent.application_id)
                      {
                        component.parent.fireEvent('idchanged', result.application_id);
                      }
                    },
                    afterrender: function() {
                      var cmp = this;
                      if(component.appl_data && component.appl_data.max_sum_docs!==null) {
                        cmp.setValues(component.appl_data.max_sum_docs);
                      }
                    }
                  }
                }]
              };
            }
            component.insert(0, cmpPanel);
            if(max_sum_doc_needed) {
              component.insert(1, maxSumDocUploadPanel);
            }
          }

          if(component.partDocReqs.length>0) {

            for(var k=0; k<component.partDocReqs.length; k++) {
              var docUploadPanel = {
                xtype: 'Application.components.multiuploadPanel',
                name: 'application_docs',
                uploadHandler: RPC.Applic.addFile,
                deleteHandler: RPC.Applic.removeFile,
                title: component.partDocReqs[k].requirement+' (основание: '+component.partDocReqs[k].reason+')',
                fdata: component.partDocReqs[k],
                listeners: {
                  beforeupload: function(cmp) {
                    var application_id = 0;
                    if(component.parent.applic!=null)
                      application_id=component.parent.applic.id;
                    else if(component.parent.application_id)
                      application_id=component.parent.application_id;
                    cmp.uploadParams.application_id = application_id;
                    cmp.uploadParams.requirement_id = cmp.fdata.id;
                    cmp.uploadParams.lot_id = component.lot_data.id;
                    cmp.uploadParams.doctype = APPLIC_DOC_REQUIRED;
                    cmp.uploadParams.application_part = component.partNumber;
                  },
                  uploadcomplete: function(result, action) {
                    if (result.success
                        && result.application_id
                        && result.application_id!=component.parent.application_id)
                    {
                      component.parent.fireEvent('idchanged', result.application_id);
                    }
                  },
                  afterrender: function() {
                    var cmp = this;
                    if(component.appl_data && component.appl_data.application_docs!=null) {
                      var docs = [];
                      var req_id = cmp.fdata.id;
                      for(var d=0; d<component.appl_data.application_docs.length; d++) {
                        if(component.appl_data.application_docs[d].requirement_id==req_id) {
                          docs.push(component.appl_data.application_docs[d]);
                        }
                      }
                      if (docs.length>0) {
                        cmp.setValues(docs);
                      }
                    }
                  }
                }
              };
              Ext.getCmp(docPanelId).insert(0, docUploadPanel);
            }
            Ext.getCmp(docPanelId).doLayout();
          }
          component.doLayout();
        }

      },
      getValues: function() {
        var v = {};
        collectComponentValues(this, v,true);
        return v;
      },
      setValues:function(v) {
        setComponentValues(this, v, true);
      }
    });
    Application.components.ApplicPartForm.superclass.initComponent.call(this);
  }
});
