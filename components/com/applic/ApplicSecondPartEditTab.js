/**
 * Компонент выводит вторую часть заявки на участие в процедуре.
 * @parent Application.components.ApplicEditTab
 *
 * @param partNumber - номер части заявки
 *
 */
Application.components.ApplicSecondPartEditTab = Ext.extend(Application.components.ApplicEditTab, {
  frame: true,
  border: false,
  initComponent : function () {
    var component = this;
    component.docOtherPanelId = Ext.id();
    this.items = this.buildForm(this.partNumber);


    component.docPanelId = 'req_docs_part_2';
    component.parent.max_sum_doc_needed = true;
    addEvents(this, ['lotloaded', 'applicloaded']);

    Ext.apply(this, {
      title: 'Вторая часть заявки',
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
      autoHeight: true,
      items: this.items,
      listeners: {
        lotloaded: function(lotData) {
          var docPanelId = component.docPanelId;

          component.partDocReqs=component.setDocReqs(component.partNumber);

          if(component.parent.totalParts==2) {
            var cmpDataPanel = this.createCmpDataPanel();
            this.insert(0, cmpDataPanel);
          }
            /*if(!component.parent.noneditable) {
              var contragent_accreds = Main.contragent.supplier_accreditations;
              component.parent.max_sum_doc_needed = false;
              if(contragent_accreds.length>0) {
               var profile_id = contragent_accreds[0].profile_id;
               if((profile_id==SUPPLIER_TYPE_UR_RF || profile_id==SUPPLIER_TYPE_UR_FOREIGN)
                 && (Main.user.max_sum==null || Main.user.max_sum=='')) {
                 component.parent.max_sum_doc_needed=true;
               }
              }
            }*/
            /*if(component.parent.max_sum_doc_needed) {
              var maxSumDocFieldset =  this.getDocumentFieldset('max_sum_docs_fset', 'Решение об одобрении или совершении крупной сделки');
              var maxSumDocUploadPanel = this.constructDocumentUploadPanel('max_sum_docs', APPLIC_DOC_MAXSUM, component.partNumber, undefined);
              maxSumDocFieldset.items.push({
                html: 'Решение об одобрении или совершении крупной сделки либо копия такого решения в случае, если требование о необходимости наличия такого решения для совершения крупной сделки установлено законодательством РФ и (или) учрелительными документами юридического лица и если для участника процедуры закупки поставки товаров, выполнения работ, оказания услуг, являющихся предметом договора, или внесение денежных средств в качестве обеспечения заявки на участие в процедуре, обеспечения исполнения договора являются крупной сделкой'
              });
              maxSumDocFieldset.items.push(maxSumDocUploadPanel);
              this.insert(1, maxSumDocFieldset);
              this.doLayout();
            }*/


          if (component.parent.lot_data.simple_requirements) {
            Ext.getCmp(component.docOtherPanelId).insert(0, {
              html: 'Заказчиком установлены требования к прилагаемым документам:'
            }, {
              xtype: 'displayfield',
              width: '99%',
              value: Ext.util.Format.nl2br(component.parent.lot_data.simple_requirements)
            });
          }

          if (!component.partDocReqs || component.partDocReqs.length==0) {
            callComponents([component.docPanelId], function(c){c.destroy();});
          } else {
            for(var k=0; k<component.partDocReqs.length; k++) {
              var docUploadPanel = this.constructDocumentUploadPanel('application_docs', APPLIC_DOC_REQUIRED, component.partNumber, component.partDocReqs[k]);
              Ext.getCmp(docPanelId).add(docUploadPanel);
            }
            Ext.getCmp(docPanelId).doLayout();
          }

        },
        applicloaded : function(applic_data) {
          component.appl_data = false;
          if (!component.parent.applic.parts) {
            component.parent.applic.parts = [];
          }
          for (var i=0; i<component.parent.applic.parts.length; i++) {
            if (2==component.parent.applic.parts[i].partNumber) {
              component.appl_data = component.parent.applic.parts[i];
              break;
            }
          }
          if (!component.appl_data && component.parent.applic.parts[1]) {
            component.appl_data = component.parent.applic.parts[1];
          }
          if (!component.appl_data) {
            component.appl_data = {};
          }
          if (((component.appl_data.full_name && component.appl_data.full_name != Main.contragent.full_name)
                || (component.appl_data.inn && component.appl_data.inn != Main.contragent.inn))
              && !component.parent.noneditable) {
            Ext.Msg.alert('Предупреждение', 'Данные вашей организации отличаются от указанных в заявке. Для их обновления необходимо отозвать заявку и подать ее снова.');
          }
          component.setValues(component.appl_data);
          if (applic_data && applic_data.eds_info) {
            component.add({
              xtype: 'fieldset',
              title: 'Подпись',
              html: applic_data.eds_info
            });
            component.doLayout();
          }
        }
      }
    });
    Application.components.ApplicSecondPartEditTab.superclass.initComponent.call(this);
  },

  buildForm : function() {
    var items = [];
    items.push(this.getPartNumberHiddenField(this.partNumber));
    items.push(this.getDocumentFieldset('req_docs_part_2', 'Документы, затребованные организатором процедуры закупки во второй части заявки'));
    //this.docOtherPanelId = Ext.id();
    var docOtherPanel = this.getDocumentFieldset(this.docOtherPanelId, Main.config.detailed_requirements?'Иные документы':'Документы');
    docOtherPanel.items.push(this.constructDocumentUploadPanel('application_docs_other',APPLIC_DOC_OTHER,2,undefined));
    items.push(docOtherPanel);
    return items;
  },

  setMode: function(mode) {
    if ('updatefiles'!=mode) {
      return;
    }
    this.getComponent(0).disable();
  }
});
