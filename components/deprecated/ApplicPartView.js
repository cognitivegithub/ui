/**
 * Компонент выводит нужную часть заявки на участие в процедуре.
 *
 * Параметры: partNumber - номер части заявки
 *            procedure_data - данные о процедуре
 *            applic - сохраненные прежде данные заявки
 */
Application.components.ApplicPartView = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
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
    var docPanelName = 'Документы, затребованные организатором процедуры '+((component.partNumber===1) ? 'в первой' : 'во второй')+' части заявки на участие';
    
    Ext.apply(this,
      {
        xtype: 'panel',
        border: false,
        frame: true,
        name: 'parts[]',
        layout : 'form',
        labelWidth: 400,
        defaults: {
          allowBlank: false,
          minLengthText: 'Слишком короткое значение',
          maxLengthText: 'Слишком длинное значение',
          anchor: '100%'          
        },
        monitorValid : true,
        title: partName,
        autoHeight: true,
        items: [
        {
          xtype: 'fieldset',
          title: docPanelName,
          id: docPanelId,
          hidden: (component.partDocReqs.length===0),
          items: [
            
          ]
        }, {
          xtype: 'fieldset',
          title: 'Иные документы',
          items: [
            {
              xtype: 'Application.components.filelistPanel',
              title: 'Прочие документы на усмотрение заявителя',
              name: 'application_docs_other',
              withHash: false,
              listeners: {
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
        afterrender: function() {
          if(component.partNumber===1) {
             var applicTextCnt = {
               xtype: 'fieldset',
               title: 'Согласие на поставку, приобретение товаров, выполнение работ, оказание услуг',
               items:[
                 {
                  xtype: 'textarea',
                  value: getApplicText(),
                  anchor: '100%',
                  readOnly: true,
                  name: 'application_text',
                  style: 'background: transparent; height: 180px; padding: 3px 10px; font-size: 8pt;',
                  hideLabel: true
                 }
               ]
             };
             var priceField = {
               xtype: 'textfield',
               name: 'price',
               readOnly: true,
               fieldLabel: 'Цена предложения в валюте начальной цены договора',
               value: (component.applic_data)? Ext.util.Format.formatPrice(component.applic_data.price):'',
               hidden: (component.procedure_type!=PROCEDURE_TYPE_AUC_ASC && component.procedure_type!=PROCEDURE_TYPE_AUC_DESC) ? false:true
             };
             component.insert(0,applicTextCnt);
             component.insert(1,priceField);
             if(units.length>0) {
              for(var i=0; i<units.length; i++) {
                var reqs = units[i].requirements||[];
                var application_trademark = (component.appl_data)? component.appl_data.application_units[i].trademark : false;
                var trademark = (application_trademark) ? application_trademark : units[i].trademark;
                var paramCnt = {
                  xtype: 'fieldset',
                  title: 'Показатели и качественные характеристики товара',
                  id: paramPanelId,
                  name: 'application_units[]',
                  readOnly: true,
                  labelWidth: 300,
                  style: 'background: transparent;',
                  defaults: {
                    anchor: '100%',
                    style: 'background: transparent; border: none;'
                  },
                  items:[
                    {
                      xtype: 'textfield',
                      name: 'unit_name',
                      value: units[i].name,
                      readOnly: true,
                      fieldLabel: 'Наименование'
                    },
                    {
                      xtype: 'textfield',
                      name: 'trademark',
                      value: trademark,
                      readOnly: true,
                      fieldLabel: 'Торговая марка поставляемого товара'
                    }, {
                      xtype: 'textfield',
                      name: 'price',
                      readOnly: true,
                      fieldLabel: 'Цена в валюте начальной цены лота',
                      value: (component.applic_data)? Ext.util.Format.formatPrice(component.appl_data.application_units[i].price) : Ext.util.Format.formatPrice(units[i].price),
                      hidden: !component.lot_data.single_unit
                    }
                  ],
                  unit_id: units[i].id,
                  application_unit_id: (component.appl_data)? component.appl_data.application_units[i].id :null
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
                        style: 'background: transparent; border: none;',
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
                          readOnly: true,
                          name: 'value',
                          value: (applic_unit_params!==null && applic_unit_params[n]) ? applic_unit_params[n].value : (reqs[n].value||''),
                          readOnly: (reqs[n].type=='EXACT')?true:false
                        }
                      ],
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
              xtype: 'Application.components.cmpDataView',
              cmpData: company_data,
              listeners: {
                beforerender: function() {
                  var ct = this;
                  if(max_sum_doc_needed) {
                    var maxSumDocUploadPanel = {
                      xtype: 'Application.components.filelistPanel',
                      style: 'background: transparent;',
                      name: 'max_sum_docs',
                      title:'Решение об одобрении или совершении крупной сделки либо копия такого решения',
                      withHash: false,
                      listeners: {
                        afterrender: function() {
                          var cmp = this;
                          if(component.appl_data && component.appl_data.max_sum_docs!==null) {
                            cmp.setValues(component.appl_data.max_sum_docs);
                          }
                        }
                      }
                    };
                    ct.add(maxSumDocUploadPanel);
                    ct.doLayout();
                  }
                }
              }
            };
            component.insert(0, cmpPanel);
          }
          
          if(component.partDocReqs.length>0) {
            
            for(var k=0; k<component.partDocReqs.length; k++) {
              var docUploadPanel = {
                xtype: 'Application.components.filelistPanel',
                name: 'application_docs',
                title: component.partDocReqs[k].requirement+' (основание: '+component.partDocReqs[k].reason+')',
                fdata: component.partDocReqs[k],
                withHash: false,
                listeners: {
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
      setValues:function(v) {
        setComponentValues(this, v, true);
      }
    });
    Application.components.ApplicPartView.superclass.initComponent.call(this);
  }
});
