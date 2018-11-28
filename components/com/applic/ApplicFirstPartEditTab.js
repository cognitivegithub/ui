/**
 * Компонент выводит первую часть заявки на участие в процедуре.
 * @parent Application.components.ApplicEditTab
 *
 * @params partNumber - номер части заявки
 *
 */
Application.components.ApplicFirstPartEditTab = Ext.extend(Application.components.ApplicEditTab, {
  frame: true,
  border: false,
  initComponent : function () {
    var component = this;
    component.mode = component.parent.mode;
    this.ids = this.ids||{};
    this.ids.app_units_display = Ext.id();
    this.ids.app_units_position_display = Ext.id();
    this.ids.app_units_position_grid = Ext.id();
    this.ids.price = Ext.id();
    this.ids.docOtherPanelId = 'application_docs_other_1';

    component.docExplainPanelId = 'application_explain_documents_1';
    var cmpItems = this.buildForm(this.partNumber);

    component.docPanelName = 'Документы, затребованные организатором в составе '+((component.partNumber===1) ? 'первой' : 'второй')+' части заявки на участие';
    component.docPanelId = 'req_docs_part_1';

    //component.paramPanelId = 'application_units';
    component.parent.max_sum_doc_needed = true;

    addEvents(this, ['lotloaded', 'applicloaded']);

    Ext.apply(this, {
      title: component.title ? component.title : ((component.parent && component.parent.totalParts==1) ? 'Заявка на участие':'Первая часть заявки'),
      xtype: 'form',
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
      monitorValid : false,
      autoHeight: true,
      items: cmpItems,
      listeners: {
        lotloaded: function(lotData) {
//          if(component.parent.totalParts==1) {
//            this.setTitle('Заявка на участие');
//          }
          var params = {};
          params.contragent_type = (Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_RF && Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_FOREIGN) ? 'fizik':'urik';
          if (component.parent.procedure_type==PROCEDURE_TYPE_AUC_ASC_26) {
            params.pp26 = true;
          }
          if (Main.config.agreement_not_for_auctions
              || (!Main.config.agreement_not_for_auctions &&
                !(component.parent.procedure_type==PROCEDURE_TYPE_TENDER
                || component.parent.procedure_type==PROCEDURE_TYPE_PRICELIST_REQ
                || component.parent.procedure_type==PROCEDURE_TYPE_QUOTATION_REQ))) {

             performRPCCall(RPC.Reference.getApplicationText, [params], null, function(resp) {
               var applicationText = resp.application_text;
               Ext.getCmp('application_text').setValue(applicationText);
             });
          } else {
            Ext.getCmp('fieldset_application_text').setVisible(false);
          }
          if (lotData.customer_agree_form) {
            Ext.getCmp('fieldset_application_text').setVisible(false);
          }
          component.partDocReqs=component.setDocReqs(component.partNumber);
          if (component.parent.procedure_type==PROCEDURE_TYPE_AUC_ASC_26) {
            Ext.getCmp('fieldset_application_text').setTitle('Согласие участника аукциона с условиями аукционной документации / Согласие на обработку персональных данных');
            var parent_fildst = Ext.getCmp(this.ids.docOtherPanelId).findParentByType('fieldset');
            if (parent_fildst.title=='Иные документы') {
              parent_fildst.setTitle('Иные документы, необходимые в соответствии с 26 – ПП');
            }
            if (component.mode=='view' && lotData.lot.status==Application.models.Procedure.statuses.first_parts) {
              parent_fildst.hide();
            }
          }
          var docPanel = Ext.getCmp(component.docPanelId);
          var paramPanel = Ext.getCmp(component.ids.app_units_display);
//          var positionGrid = Ext.getCmp(component.ids.app_units_position_grid);

          var units = component.parent.lot_data.lot_units;

          /*if (component.parent.procedure_type == Application.models.Procedure.type_ids.positional_purchase) {
            var posData = [];
            if(units.length>0) {
              for(var i=0; i<units.length; i++) {
                var posCnt = this.createPosCnt(units[i]);
                posData.push(posCnt);
              }
              positionGrid.store.loadData(posData);
            }
          } else {
          }*/
          if (paramPanel) {
          if(units.length>0) {
            for(var i=0; i<units.length; i++) {
              var paramCnt = this.createParamCnt(units[i]);
              paramPanel.add(paramCnt);
            }
            paramPanel.doLayout();
          }
          }
          if (!component.application_id && component.parent.totalParts == 1 &&
            component.parent.procedure_type != PROCEDURE_TYPE_AUC_ASC_26) {
            var cmpDataPanel = this.createCmpDataPanel();
            this.insert(0, cmpDataPanel);
            this.doLayout();
          }
            /*if(!component.parent.noneditable) {
              var contragent_accreds = Main.contragent.supplier_accreditations;
              component.parent.max_sum_doc_needed = false;
              if(contragent_accreds.length>0) {
               var profile_id = contragent_accreds[0].profile_id;
               if((profile_id==SUPPLIER_TYPE_UR_RF || profile_id==SUPPLIER_TYPE_UR_FOREIGN)
                 && (Main.user.max_sum==null || Main.user.max_sum=='')) {
                 component.parent.max_sum_doc_needed=false;
               }
              }
            }*/
           /* if(component.parent.max_sum_doc_needed) {
              var maxSumDocFieldset =  this.getDocumentFieldset('max_sum_docs_fset', 'Решение об одобрении или совершении крупной сделки');
              var maxSumDocUploadPanel = this.constructDocumentUploadPanel('max_sum_docs', APPLIC_DOC_MAXSUM, component.partNumber, undefined);
              maxSumDocFieldset.items.push({
                html: 'Решение об одобрении или совершении крупной сделки либо копия такого решения в случае, если требование о необходимости наличия такого решения для совершения крупной сделки установлено законодательством РФ и (или) учрелительными документами юридического лица и если для участника процедуры закупки поставки товаров, выполнения работ, оказания услуг, являющихся предметом договора, или внесение денежных средств в качестве обеспечения заявки на участие в процедуре, обеспечения исполнения договора являются крупной сделкой'
              });
              maxSumDocFieldset.items.push(maxSumDocUploadPanel);
              component.insert(1, maxSumDocFieldset);
            }*/


          if(component.partDocReqs && component.partDocReqs.length>0) {
            for(var k=0; k<component.partDocReqs.length; k++) {
              var docUploadPanel = this.constructDocumentUploadPanel('application_docs', APPLIC_DOC_REQUIRED, component.partNumber, component.partDocReqs[k]);
              docPanel.add(docUploadPanel);
            }
            docPanel.doLayout();
          } else {
            var cmp_req_docs_part_1 = Ext.getCmp('req_docs_part_1');
            if (cmp_req_docs_part_1) {
              cmp_req_docs_part_1.destroy();
            }
          }

          //component.setDisabled(lotData.paper_form);
          component.doLayout();
        },
        applicloaded : function(applic_data) {
          if (component.parent.totalParts == 1 && component.parent.procedure_type != PROCEDURE_TYPE_AUC_ASC_26) {
            var cmpDataPanel = this.createCmpDataPanel(true);
            this.insert(0, cmpDataPanel);
            this.doLayout();
          }
          if (applic_data.order_number_added) {
            this.setTitle('Заявка на участие №'+applic_data.order_number_added);
          }
          var lotData = component.parent.lot_data;
          var totalParts = component.parent.totalParts;
          component.appl_data = component.parent.applic.parts[0];
          if (((component.appl_data.full_name && component.appl_data.full_name != Main.contragent.full_name)
                || (component.appl_data.inn && component.appl_data.inn != Main.contragent.inn))
              && !component.parent.noneditable 
              && !(isCustomer() && Main.config.allow_customer_add_applic)) { // alena 3844 
            Ext.Msg.alert('Предупреждение', 'Данные вашей организации отличаются от указанных в заявке. Для их обновления необходимо отозвать заявку и подать ее снова.');
          }
          component.setValues(component.appl_data);

          if(component.appl_data.application_units) {
            for(var i=0; i<component.appl_data.application_units.length; i++) {
              var unitCnt = Ext.getCmp('application_units_'+component.appl_data.application_units[i].unit_id);
              if(unitCnt) {
                unitCnt.setValues(component.appl_data.application_units[i]);
                if(component.appl_data.application_units[i].application_unit_params) {
                  // Сортируем массив по param_id
                  component.appl_data.application_units[i].application_unit_params.sort(function(a, b){
                    var keyA = a.param_id,
                      keyB = b.param_id;
                    if (keyA < keyB) {return 1;}
                    if (keyA > keyB) {return -1;}
                    return 0;
                  });
                  var paramCnt = Ext.getCmp('application_unit_params_'+component.appl_data.application_units[i].unit_id);
                  var j = 0 ;
                  if(paramCnt) {
                    paramCnt.items.each(function(c){
                      var v = component.appl_data.application_units[i].application_unit_params[j];
                      setComponentValues(c, v);
                      j++;
                    });
                  }
                }
              }
            }
          }
          if (!component.appl_data.application_explain_documents || component.appl_data.application_explain_documents.length == 0) {
            var docExplainPanel = Ext.getCmp(component.docExplainPanelId);
            if (docExplainPanel) {
              docExplainPanel.destroy();
              component.doLayout();
            }
          }
          if (applic_data && applic_data.eds_info) {
            component.add({
              xtype: 'fieldset',
              title: 'Подпись',
              html: applic_data.eds_info
            });
            component.doLayout();
          }

        },
        afterrender : function() {
          if (!component.parent.lot_data) {
            component.parent.lot_data = {};
          }
          var units = component.parent.lot_data.lot_units;
          // Если нет парамов - убиваем филдсет
          if(!units || units.length==0 /*|| component.parent.procedure_type == Application.models.Procedure.type_ids.positional_purchase*/) {
            Ext.getCmp(this.ids.app_units_display).destroy();
          } else {
//            Ext.getCmp(this.ids.app_units_position_display).destroy();
          }
          // Если нет требований к докам - убиваем филдсет
          if (component.partDocReqs && component.partDocReqs.length==0) {
            var cmp_req_docs_part_1 = Ext.getCmp('req_docs_part_1');
            if (cmp_req_docs_part_1) {
              cmp_req_docs_part_1.destroy();
            }
          }

          // alena POSPBA-364 -->--
          // при вводе заявки заказчиком для бумажных торгов надо ввести дату и время подачи
          if (Main.config.allow_customer_add_applic
              && Application.models.Procedure.groups.paper_forms.indexOf(component.parent.procedure_type) >= 0) {
             component.add({
               xtype: 'fieldset',
               style: 'margin: 5px;',
               layout: 'column',
               defaults: {
                 anchor: '100%'
               },
               items: [
                  { html: 'Дата и время подачи заявки' + REQUIRED_FIELD + ':',
                    columnWidth: 0.3
                  }
                , { xtype: 'Application.components.dateField',
                    altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
                    allowBlank: false,
                    name: 'date_published',
                    width: 90,
                    value: now(),
                    format: 'd.m.Y',
                    columnWidth: 0.14
                  }
                , { html: '&nbsp',
                    columnWidth: 0.02
                  }
                , { xtype: 'timefield',
                    allowBlank: false,
                    name: 'time_published',
                    value: now(),
                    width: 60,
                    format: 'H:i'
              }]
             });
          }
          // --<-- alena POSPBA-364
          
          // Если тип процедуры подразумевает ввод цены предложения в заявку - показываем поле
          var priceAllowBlank ='';
          var noneditablePrice = component.parent.noneditable;
          if (Application.models.Procedure.groups.price_requested.indexOf(component.parent.procedure_type) >= 0
              || Main.config.allow_customer_add_applic ) { // alena 3844 если заказчик вводит заявку от поставщика
            if(!noneditablePrice) {
              priceAllowBlank = REQUIRED_FIELD;
            }
            var priceStyle = null;
            if(component.parent.noneditable) {
              priceStyle = 'background: transparent; border: none;';
            }
            var priceField = {
             xtype: 'Application.components.priceField',
             name: 'price',
             id: this.ids.price,
             allowBlank: false,
             readOnly: noneditablePrice,
             //maxValue: component.parent.lot_data.start_price,
             style: priceStyle,
             //maxValueText: 'Цена предложения не может превышать начальную максимальную цену лота, указанную в извещении',
             value: (component.appl_data) ? component.appl_data.price:null,
             fieldLabel: 'Цена предложения в валюте начальной цены договора'+priceAllowBlank
           };

           var withVat = {};
           if (component.parent.procedure_type==PROCEDURE_TYPE_TENDER || 
               component.parent.procedure_type==PROCEDURE_TYPE_PRICELIST_REQ || 
               component.parent.procedure_type==PROCEDURE_TYPE_QUOTATION_REQ ||
               component.parent.procedure_type==PROCEDURE_TYPE_PERETORG_REDUC ||
               component.parent.procedure_type==PROCEDURE_TYPE_PERETORG_TENDER) {
             withVat = {
               xtype: 'checkbox',
               name: 'price_with_vat',
               boxLabel: 'С учетом НДС',
               disabled: noneditablePrice,
               checked: (component.appl_data) ? component.appl_data.price_with_vat:true,
               listeners: {
                 check: function(obj, v) {
                   if (noneditablePrice) {
                     this.setVisible(v);
                   }                 
                   var nds_percent = Ext.getCmp(component.ids.nds_percent_id);
                   if (nds_percent) {
                     nds_percent.setVisible(v);
                     nds_percent.setDisabled(!v);
                   }
                 },
                 valueFilled: function(v) {
                   var nds_percent = Ext.getCmp(component.ids.nds_percent_id);
                   if (nds_percent) {
                     nds_percent.setVisible(v);
                     nds_percent.setDisabled(!v);
                   }
                 }
               }
             };
           }

             component.add({
               xtype: 'fieldset',
               title: 'Цена предложения',
               style: 'margin: 5px;',
               defaults: {
                 anchor: '100%'
               },
               layout: 'form',
               labelWidth: 400,
               items: [priceField,withVat]
             });
          }
          var warningText = '';
          var procTypesToCheck = [PROCEDURE_TYPE_AUC_ASC, PROCEDURE_TYPE_AUC_DESC, PROCEDURE_TYPE_TENDER, PROCEDURE_TYPE_QUOTATION_REQ, PROCEDURE_TYPE_PRICELIST_REQ];
          if (isSupplier()){
          var showMessage = (!!Main.config.negative_block_for_any_procedure &&  procTypesToCheck.indexOf(component.parent.procedure_type) > 0);
          if( (component.parent.procedure_type==PROCEDURE_TYPE_AUC_ASC ||
             component.parent.procedure_type==PROCEDURE_TYPE_AUC_DESC ||
             component.parent.procedure_type==PROCEDURE_TYPE_TENDER || showMessage) &&
             !component.parent.noneditable && (Main.contragent.available_sum<component.parent.lot_data.service_fee)
             && component.parent.lot_data.guarantee_application==null)
          {
              warningText = "Ваша заявка не будет передана на рассмотрение организатору, если на вашем счете для обеспечения участия в процедурах на момент окончания приема заявок будет отрицательный баланс (подача данной заявки заблокирует на нем {0} рублей). В случае вашей победы эта сумма будет списана в качестве платы за участие в соответствующей процедуре. Убедительная просьба, денежные средства в размере обеспечения заявки или платы за участие в процедуре перечислять заранее, до момента окончания приема заявок.";
              var fee = component.parent.lot_data.service_fee;
              component.add({
               xtype: 'fieldset',
               hideTitle: true,
               style: 'margin: 5px; background-color: red;border: none; color: #fff',
               anchor: '100%',
               border: false,
               layout: 'anchor',
               html: String.format(warningText, Ext.util.Format.price(fee))
             });
          }
          }
          if( (component.parent.procedure_type==PROCEDURE_TYPE_QUOTATION_REQ) &&
             !component.parent.noneditable
             && (0 == component.parent.lot_data.service_fee)
             && (Main.contragent.available_sum<component.parent.lot_data.peretorg_service_fee)
             && component.parent.lot_data.guarantee_application==null)
          {
              warningText = "На стадии подведения итогов процедуры может быть объявлена переторжка. Для участия в ней на вашем счете должна быть сумма {0} рублей. В случае недостаточной суммы на счете ваша заявка будет отменена.";
              var peretorg_fee = component.parent.lot_data.peretorg_service_fee;
              component.add({
               xtype: 'fieldset',
               hideTitle: true,
               style: 'margin: 5px; background-color: red;border: none; color: #fff',
               anchor: '100%',
               border: false,
               layout: 'anchor',
               html: String.format(warningText, Ext.util.Format.price(peretorg_fee))
             });
          }
          component.doLayout();
        }
      }
    });
    Application.components.ApplicFirstPartEditTab.superclass.initComponent.call(this);
  },

  validate: function() {
    if (Main.config.allow_single_unit && this.parent.lot_data.single_unit && this.parent.lot_data.unit_price) {
      this.parent.lot_data.start_price = this.parent.lot_data.unit_price;
    }
    if (this.parent && Application.models.Procedure.groups.price_requested.indexOf(this.parent.procedure_type)>=0) {
      if (!(this.parent.procedure_type == PROCEDURE_TYPE_QUOTATION_REQ && !this.parent.lot_data.start_price)) {
        var price = Ext.getCmp(this.ids.price);
        if (!this.parent.procedure_data.price_increase && price && price.getValue()>this.parent.lot_data.start_price && this.parent.lot_data.start_price) {
          if (!Main.config.price_increase_for_org_inns
              || Main.config.price_increase_for_org_inns.indexOf(this.parent.procedure_data.org_inn) < 0
          ) {
            return {success:false, msg: 'Цена предложения превышает начальную максимальную цену лота, указанную в извещении', fatal: true};
          }
        }
      }
    }
    return true;
  },

  buildForm : function() {
    var items = [];
    items.push(this.getPartNumberHiddenField(this.partNumber));

    var applicTextCnt = {
      xtype: 'textarea',
      anchor: '100%',
      style: 'height: 180px;',
      readOnly: true,
      name: 'application_text',
      id: 'application_text'
    };

    items.push({
       xtype: 'fieldset',
       id: 'fieldset_application_text',
       title: 'Согласие на поставку, выполнение работ, оказание услуг',
       style: 'margin: 5px',
       anchor: '100%',
       layout: 'anchor',
       items: [applicTextCnt],
       hidden: Main.config.fieldset_application_text_hide
    });

    items.push(this.getUnitParamFieldset());
    items.push(this.getDocumentFieldset('req_docs_part_1', 'Документы, затребованные организатором процедуры закупки в первой части заявки'));
    var docOtherPanel = this.getDocumentFieldset(this.docOtherPanelId, Main.config.detailed_requirements?'Иные документы':'Документы');
    docOtherPanel.items.push(this.constructDocumentUploadPanel('application_docs_other',APPLIC_DOC_OTHER,1,undefined));
    items.push(docOtherPanel);

    if (Main.config.applic_show_explain_docs && this.noneditable) {
      var docExplainPanel = this.getDocumentFieldset(this.docExplainPanelId, 'Разъяснение положений заявки');
      docExplainPanel.items.push(this.constructDocumentUploadPanel('application_explain_documents',undefined,undefined,undefined));
      items.push(docExplainPanel);
    }
//    items.push(this.getUnitPositionFieldset());
    return items;
  },
  getUnitParamFieldset : function() {
    return {
      xtype: 'fieldset',
      title: 'Характеристики поставляемых товаров',
      id: this.ids.app_units_display,
      hidden: Main.config.app_units_hide,
      items: []
    };
  },
  getUnitPositionFieldset : function() {
    var myReaderMap = Ext.data.Record.create([
      {name: 'id', mapping: 0},
      {name: 'pos_number', mapping: 1},
      {name: 'name', mapping: 2},
      {name: 'quantity', mapping: 3},
      {name: 'okei_symbol', mapping: 4},
      {name: 'price', mapping: 5},
      {name: 'price_nds', mapping: 6}
    ]);
    var myReader = new Ext.data.ArrayReader({
      id: 0
    }, myReaderMap);
    var store = new Ext.data.Store({
      autoDestroy: true,
      reader: myReader
    });

    var dataGridColumns = [{
      header: "",
      width: 20,
      dataIndex: 'addme',
      xtype: 'checkcolumn',
      checked: false
    }, {
      header: "№",
      width: 30,
      dataIndex: 'pos_number'
    }, {
      header: "Наименование",
      dataIndex: 'name'
    }, {
      header: "Количество",
      width: 60,
      editor: Ext.ux.helpers.textEdit(),
      dataIndex: 'quantity'
    }, {
      header: "Цена за единицу (Без НДС)",
      width: 80,
      editor: Ext.ux.helpers.textEdit(),
      dataIndex: 'price'
    }, {
      header: "Общая цена (Без НДС)",
      width: 80,
      editor: Ext.ux.helpers.textEdit(),
      dataIndex: 'price_nds'
    }];
    var posGrid = new Ext.grid.EditorGridPanel({
      id: this.ids.app_units_position_grid,
      store: store,
      viewConfig: {
        forceFit:true
      },
      columns: dataGridColumns,
      autoHeight: true,
      hideTitle: true,
      border: true,
      name: 'pos_list',
      getValues: function() {
        var values = [];
        var modified = this.store.modified;
        for (var i = 0; i < modified.length; i++) {
          if (!modified[i].data.addme) continue;
          values.push({
            id: modified[i].id,
            data: modified[i].data
          });
        }
        return values;
      },
      setValues: function(values) {
      }
    });
    return {
      xtype: 'fieldset',
      title: 'Закупочные позиции',
      id: this.ids.app_units_position_display,
      items: [
        posGrid
      ]
    };
  },
  createPosCnt: function(unit) {
    return [
      parseInt(unit.id),
      unit.pos_number,
      unit.name,
      unit.quantity,
      unit.okei_symbol,
      Ext.util.Format.formatPrice(unit.pos_price),
      Ext.util.Format.formatPrice(unit.pos_price * unit.quantity)
    ];
  },
  createParamCnt : function(unit) {
    var reqs = unit.requirements||[];
    var trademark = unit.trademark;

    var defStyle = (this.noneditable) ? 'background: transparent; border: none;' : null;
    var paramCnt = {
      xtype: 'fieldset',
      name: 'application_units[]',
      id: 'application_units_'+unit.id,
      labelWidth: 300,
      defaults: {
        anchor: '100%',
        readOnly: this.noneditable,
        style: defStyle
      },
      items:[
        {
          xtype: 'hidden',
          name: 'id'
        },
        {
          xtype: 'textfield',
          name: 'name',
          value: unit.name,
          style: 'background: transparent; border: none;',
          fieldLabel: 'Наименоваие товара',
          readOnly: true
        },
        {
          xtype: 'textfield',
          name: 'trademark',
          value: trademark,
          fieldLabel: 'Торговая марка поставляемого товара'
        }, {
          xtype: 'textfield',
          name: 'price',
          id: 'price_'+unit.id,
          fieldLabel: 'Цена в валюте начальной цены лота',
          value: unit.price,
          hidden: (unit.price) ? false : true,
          disabled: (unit.price) ? false : true
        }
      ],
      unit_id: unit.id,
      application_unit_id: null,
      getValues: function() {
        var v = {unit_id : this.unit_id};

        collectComponentValues(this, v,true);
        return v;
      },
      setValues: function(v) {
        setComponentValues(this, v, true);
      }
    };
    if(reqs.length>0) {
      var paramPanel = {
        hideTitle: true,
        id: 'application_unit_params_'+unit.id,
        defaults: {
          layout: 'form',
          labelWidth: 300,
          allowBlank: false,
          anchor: '100%'
        },
        frame: false,
        items: [],
        getValues: function() {
          var v = {};
          collectComponentValues(this, v,false);
          return v;
        }
      };

      for(var n=0; n<reqs.length; n++) {
        var eachParam = {
          xtype: 'panel',
          name: 'application_unit_params[]',
          defaults: {
            allowBlank: false,
            readOnly: this.noneditable,
            style: defStyle,
            anchor: '100%'
          },
          items:[
            {
              xtype: 'hidden',
              name: 'id'
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
              value: (reqs[n].value||''),
              readOnly: (reqs[n].type=='EXACT')?true:false
            }
          ],
          getValues: function() {
            var v = {};
            collectComponentValues(this, v,true);
            return v;
          }
        };
        paramPanel.items.push(eachParam);

      }
      paramCnt.items.push(paramPanel);
    } else if (unit.simple_requirements) {
      paramCnt.items.push({
        xtype: 'displayfield',
        fieldLabel: 'Требования к товару, установленные заказчиком',
        style: 'padding-top: 3px;',
        value: Ext.util.Format.nl2br(unit.simple_requirements)
      }, {
        xtype: 'textarea',
        fieldLabel: 'Характеристики товара',
        name: 'simple_parameters'
      });
    }
    return paramCnt;
  }
});
