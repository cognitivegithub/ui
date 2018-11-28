Application.models.Lot = {
 statuses: {
    '0': 'добавлен',
    '1': 'подписан',
    '2': 'опубликован',
    '3': 'вскрытие конвертов',
    '4': 'рассмотрение заявок',
    '5': 'торги',
    '6': 'подведение итогов',
    '7': 'заключение договора',
    '8': 'архив',
    '9': 'приостановлен',
    '10': 'отменен'
  },

  paymentStepsEmpty: 'В течение не более 30-ти календарных дней с момента поставки товара, ' +
  'выполнения работ, оказания услуг',
  
  getLotFields : function(procedure_type, mode) {
    if(!mode) {
      mode = 'full';
    }

    var lotFields = {};
    var proc = Application.models.Procedure;
    var types = proc.getType(procedure_type);
    types = types?types.statuses:null;
    if (!types ||!types.length) {
      lotFields = {
        date_end_registration : 'Дата и время окончания срока приема заявок:',
        date_end_first_parts_review : 'Дата окончания срока рассмотрения заявок:',
        date_begin_auction    : 'Дата и время проведения:'
      };
    } else {
      lotFields.date_end_registration = 'Дата и время окончания срока приема заявок:';
      if (types.indexOf(proc.statuses.applic_opened)>=0) {
        if (types.indexOf(proc.statuses.first_parts)>=0) {
          lotFields.date_applic_opened = 'Дата и время окончания срока публикации протокола вскрытия конвертов:';
        } else {
          // если нет выделенной стадии рассмотрения заявок, то вскрытие конвертов за нее
          lotFields.date_applic_opened = 'Дата рассмотрения заявок:';
        }
      }
      if (types.indexOf(proc.statuses.first_parts)>=0) {
        lotFields.date_end_first_parts_review = 'Дата окончания срока рассмотрения заявок:';
      }
      if (types.indexOf(proc.statuses.trade)>=0) {
        lotFields.date_begin_auction = 'Дата и время проведения:';
      }
      lotFields.date_end_second_parts_review = 'Дата окончания срока подведения итогов:';
      //2013/08/16 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется, поэтому date_may_canceled пока не нужно
      if (procedure_type == PROCEDURE_TYPE_AUC_ASC) {
      //  lotFields.date_may_canceled = 'Дата возможного отказа от проведения процедуры:';
        lotFields.canceled_text = 'Отказ от проведения процедуры:';
      }      
    }
    /*if ( procedure_type == PROCEDURE_TYPE_PRICELIST_REQ ||
         procedure_type == PROCEDURE_TYPE_QUALIFICATION )
    {
      lotFields = {
        date_end_registration : 'Дата и время окончания срока приема заявок:',
        date_end_second_parts_review : 'Дата окончания срока подведения итогов:'
      };
    } else if (procedure_type == PROCEDURE_TYPE_QUOTATION_REQ) {
      lotFields = {
        date_end_registration : 'Дата и время окончания срока приема заявок:',
        date_applic_opened    : 'Дата рассмотрения заявок:',
        date_end_second_parts_review : 'Дата окончания срока подведения итогов:'
      };
    } else if (procedure_type == PROCEDURE_TYPE_TENDER) {
      lotFields = {
        date_end_registration : 'Дата и время окончания срока приема заявок:',
        date_applic_opened    : 'Дата и время окончания срока публикации протокола вскрытия конвертов:',
        date_end_first_parts_review : 'Дата окончания срока рассмотрения заявок:',
        date_end_second_parts_review : 'Дата окончания срока подведения итогов:'
      };
    } else {
    // Все остальные типы
      lotFields = {
        date_end_registration : 'Дата и время окончания срока приема заявок:',
        date_end_first_parts_review : 'Дата окончания срока рассмотрения заявок:',
        date_begin_auction    : 'Дата и время проведения:'
      };
    }*/

    return lotFields;
  },
  getLotTemplates : function() {
    var lotTemplates = {
      /*'lot_documentation'     : '<ul class="lot-documentation"><tpl for="lot_documentation">'
                              + '  <li><a href="/files/{name}">{name}</a> — {descr}</li>'
                              + '</tpl></ul>',*/
      'simple_preferences'       : new Ext.XTemplate(''
                                + '<tpl if="values.simple_preferences">'
                                +   '<div class="lot-doc-requirements">{simple_preferences}</div>'
                                + '</tpl>'),
      'simple_evaluation_criteries' : new Ext.XTemplate(''
                                + '<tpl if="values.simple_evaluation_criteries">'
                                +   '<div class="lot-doc-requirements">{simple_evaluation_criteries}</div>'
                                + '</tpl>'),
      'lot_doc_requirements'  : new Ext.XTemplate(''
                              + '<tpl if="values.lot_doc_requirements!=undefined && values.lot_doc_requirements.length &gt; 0">'
                              + '<ol class="lot-doc-requirements"><tpl for="lot_doc_requirements">'
                              + '  <li>{requirement} (основание: {reason}), {application_part}-я часть заявки</li>'
                              + '</tpl></ol>'
                              + '</tpl>'
                              + '<tpl if="values.simple_requirements">'
                              +   '<div class="lot-doc-requirements">{simple_requirements}</div>'
                              + '</tpl>'
                              + '<tpl if="(values.lot_doc_requirements==undefined || values.lot_doc_requirements.length==0) && values.simple_requirements==undefined ">'
                              + 'не указаны</tpl>'),
      'lot_delivery_places'   : new Ext.XTemplate('<ol class="lot-delivery-places"><tpl for="lot_delivery_places">'
                              + '<li>'
                              + ' <ul>'
                              + '   <li>Объем поставки: {[this.processNotRequired(values.quantity)]}</li>'
                              + '   <li>Адрес поставки: {[this.processNotRequired(values.address)]}</li>'
                              + '   <li>Условия поставки: {[this.processNotRequired(values.term)]}</li>'
                              + ' </ul>'
                              + '</li>'
                              + '</tpl></ol>', {processNotRequired : function (v) {if(Ext.isEmpty(v)) return 'не указано'; else return v;}}),
      'guarantee_application' : new Ext.XTemplate('<tpl if="guarantee_application">'+
                                  '{[Ext.util.Format.formatPrice(values.guarantee_application)]}'+
                                '</tpl>'+
                                '<tpl if="!guarantee_application">не установлено</tpl>'),
      'guarantee_contract'    : new Ext.XTemplate('<tpl if="guarantee_contract">'+
                                  '{[Ext.util.Format.formatPrice(values.guarantee_contract)]}'+
                                '</tpl>'+
                                '<tpl if="!guarantee_contract">не установлено</tpl>'),
      'guarantee_advance'    : new Ext.XTemplate('{[this.guaranteeRenderer(values)]}', {
                                  guaranteeRenderer: function(v) {
                                    var type = false;
                                    var types_store = getGuaranteeAdvanceTypesStore();
                                    if (v.guarantee_advance_type) {
                                      type = types_store.find('id', Number(v.guarantee_advance_type));
                                      if (type>=0) {
                                        type = types_store.getAt(type).data.name;
                                      } else {
                                        type = false;
                                      }
                                    }
                                    if (!Main.config.advance_guarantee_configurable && !type) {
                                      return 'не установлено';
                                    }
                                    var r = '';
                                    if (Main.config.advance_guarantee_configurable) {
                                      r = (v.guarantee_advance ? Ext.util.Format.formatPrice(v.guarantee_advance) : 'не установлено');
                                    } else {
                                      r = 'в размере не менее суммы авансовых платежей';
                                    }
                                    if (type) {
                                      r += ' ('+type+')';
                                    }
                                    return r;
                                  }
                                }),
      'guarantee_warranty'    : new Ext.XTemplate('{[this.guaranteeRenderer(values)]}', {
                                  guaranteeRenderer: function(v) {
                                    var dflt = 'не установлено';
                                    switch (Main.config.warranty_guarantee_type) {
                                      case 'text':
                                        return v.guarantee_warranty_text||dflt;
                                      case 'percent':
                                        return v.guarantee_warranty?(Ext.util.Format.formatPrice(v.guarantee_warranty)+'% от итоговой цены договора'):dflt;
                                      default:
                                        return v.guarantee_warranty?Ext.util.Format.formatPrice(v.guarantee_warranty):dflt;
                                    }
                                  }
                                }),
      'start_price'           : new Ext.XTemplate('<tpl if="start_price">'+
                                  '{[Ext.util.Format.formatPrice(values.start_price)]}'+
                                '</tpl>'+
                                '<tpl if="!start_price">не установлено</tpl>'+
                                '<tpl if="values.single_unit"> (торги за единицу, начальная цена комплекта: '+
                                '{[Ext.util.Format.formatPrice(values.unit_price)]}'+
                                ')</tpl>'),
      'insurance_types'       : new Ext.XTemplate('<tpl if="values.insurance_types && values.insurance_types != 1">'+
                                '<ul>'+
                                  '<tpl if="values.insurance_types%2==0"><li>Страхование строительно-монтажных рисков</li></tpl>'+
                                  '<tpl if="values.insurance_types%3==0"><li>Страхование грузов на время транспортировки</li></tpl>'+
                                  '<tpl if="values.insurance_types%5==0"><li>Страхование персонала от несчастного случая</li></tpl>'+
                                  '<tpl if="values.insurance_types%7==0"><li>Страхование ответственности перед третьими лицами (страхование профессиональной ответственности, страхование общегражданской ответственности и т.д)</li></tpl>'+
                                  '<tpl if="values.insurance_types%11==0"><li>Иные виды страхования (страхование имущества, личное страхование, комплексные программы страхования)</li></tpl>'+
                                '</ul>'+
                                '</tpl>'),
      date_end_first_parts_review : Ext.util.Format.localDateText,
      date_end_second_parts_review : Ext.util.Format.localDateText,
      date_applic_opened : Ext.util.Format.localDateText,
      date_end_registration   : Ext.util.Format.localDateText,
      date_begin_auction      : Ext.util.Format.localDateText,
      date_end_contract       : Ext.util.Format.localDateText,
      //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
      date_may_canceled       : Ext.util.Format.localDateText
      //2013/08/16 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется
      , canceled_text           : new Ext.XTemplate(''
                                + '<tpl if="values.canceled_text">'
                                +   '{canceled_text}'
                                + '</tpl>')
    };
    return lotTemplates;// lotTemplates
  },

  getPositionalGrid: function(lot) {

    var posRenderer = function(value, meta, record) {
//      console.log('PART', value);
      return value ? String.format('Цена: {0}<br /> НДС: {1}<br /> Цена с НДС: {2}',
        value.pos_price,
        value.pos_nds,
        value.pos_price_nds
      ) : '&mdash;';
    }

    var applicRenderer = function(value, meta, record) {
//      console.log('APPLIC REND', value);
      return value.parts[0].full_name;
    };

    var dataGridColumns = [{
      header: 'Поставщик',
      dataIndex: 'info',
      renderer: applicRenderer
    }];

    var posReaderFields = ['info'];

    for (var i = 0; i < lot.lot_units.length; i++) {
      if (!lot.lot_units[i].name) continue;

      dataGridColumns.push({
        header: lot.lot_units[i].name,
        dataIndex: 'unit_' + lot.lot_units[i].id,
        renderer: posRenderer
      });

      posReaderFields.push('unit_' + lot.lot_units[i].id);
    }

    var posStore = new Ext.data.Store({
      autoDestroy: true,
      reader: new Ext.data.JsonReader({
        fields: posReaderFields
      })
    });

    var posGrid = new Ext.grid.EditorGridPanel({
      store: posStore,
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

    return posGrid;
  },

  getPositionalPanel: function(lot) {
    var posPanel = {
      xtype     : 'fieldset',
      title     : 'Конкурентный лист',
      style     : 'margin: 5px;',
      items     : []
    }

    var posGrid = this.getPositionalGrid(lot);
    posPanel.items.push(posGrid);

    var params = {};
    params.wait_text = 'Загружается заявка';
    performRPCCall(RPC.Applic.loadAllByLot, [lot.id], params, function(resp) {
      var gridData = [];
      for (var i = 0; i < resp.applications.length; i++) {
        var part = resp.applications[i].parts[0];
        var posRow = {id: resp.applications[i].id};
        posRow['info'] = resp.applications[i];
        for (var k = 0; k < part.application_units.length; k++) {
          posRow['unit_' + part.application_units[k].unit_id] = part.application_units[k];
        }
        gridData.push(posRow);
      }
      posGrid.store.loadData(gridData);
    });

    return posPanel;
  },

  getLotDatesPanelItems : function (lot, proc, lotFields, lotTemplates) {
    var i, st, pseudo, full_name, step_data, proc_type_pseudo, dt, lotDateValues={}, lotDateTemplates={};
      var datesPanel = {
          xtype     : 'fieldset',
          style     : 'margin: 5px 5px 0px 5px;',
          title     : 'Даты проведения процедуры по лоту',
          items     : []
      };
      if (Main.config.show_timezone)
          datesPanel.title += ' (<span class="highlight-title">время отображается по вашему локальному часовому поясу: '+getLocalTimezone(true)+'</span>)';


      if(lot.steps) {
      lotFields = {};
      for(i=0; i<lot.steps.length; i++) {
        st = lot.steps[i];
        step_data = Application.models.Procedure.getStep(st.step_id);
        if ('' != step_data.pseudo) {
          pseudo = step_data.pseudo;
          full_name = step_data.full_name.defaultName;
          //proc_type_pseudo = Application.models.Procedure.type_ids[''+proc.procedure_type];
          proc_type_pseudo = proc.procedure_type;
          if(step_data.full_name[proc_type_pseudo]) {
            full_name = step_data.full_name[proc_type_pseudo];
          }
          dt = st['date_end'];
          if(Ext.isEmpty(dt)) {
            dt = st['date_start'];
          }
          lotDateValues[pseudo] = dt;

          if(step_data['displayFormat'] && step_data['displayFormat']=='d.m.Y') {
            lotDateTemplates[pseudo] = Ext.util.Format.localDateOnlyRenderer;
          } else {
            lotDateTemplates[pseudo] = Ext.util.Format.localDateText;
          }


          lotFields[pseudo] = full_name;
        }

      }
      datesPanel.items.push({
        xtype       : 'Application.components.keyValuePanel',
        border      : false,
        autoHeight  : true,
        fields      : lotFields,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotDateTemplates,
        values      : lotDateValues
      });
    } else {
      datesPanel.items.push({
        xtype       : 'Application.components.keyValuePanel',
        border      : false,
        autoHeight  : true,
        fields      : lotFields,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotTemplates,
        //fieldsShowAlways: ['lot_doc_requirements'],
        values      : lot
      });
    }
    return datesPanel;
  },
          
  getLotPanelItems : function(lot, proc, lotFields, lotTemplates, mode) {
    var items = [];
    var reqPanel;

    if(!mode) mode='full';

    if(mode=='withproc'|| mode=='withproc-short') {
      var procedureFields = {
        'registry_number'             : Main.config.lot_form ? 'Номер закупки:':'Номер процедуры',
        'title'                       : Main.config.lot_form ? 'Наименование закупки:':'Наименование процедуры',
        'procedure_type_vocab'        : Main.config.lot_form ? 'Способ определения поставщика:':'Форма торгов',
        'org_full_name'               : Main.config.lot_form ? ' Заказчик':'Организатор:',
        'date_published'              : 'Дата публикации:'
      }

      // У нас только один лот.
      // proc.registry_number = proc.registry_number+', лот № '+lot.number;

      items.push({
        xtype       : 'Application.components.keyValuePanel',
        title          :  Main.config.lot_form ? 'Cведения о закупке':'Cведения о процедуре',
        autoHeight  : true,
        style     : 'margin: 5px 5px 0px 5px;',
        fields      : procedureFields,
        templates   : {date_published: Ext.util.Format.localDateOnlyRenderer,
                       procedure_type_vocab: '{procedure_type_vocab} <tpl if="values.with_prequalification"> c проведением квалификационного отбора</tpl>'
        },
        values      : proc
      });
    }

    if (lot.cancel_files && lot.cancel_files.length>0) {
      items.push(
        {
          xtype: 'Application.components.filelistPanel',
          title: 'Извещение об отказе от проведения лота:',
          cls: 'lot-documents',
          files: lot.cancel_files,
          withHash: false,
          style     : 'margin: 5px 5px 0px 5px;'
        }
      );
    }

    if (proc.operator_files && proc.operator_files && proc.operator_files[lot.id] && proc.operator_files[lot.id].length>0) {
      items.push(
        {
          xtype: 'Application.components.filelistPanel',
          title: 'Предписания:',
          cls: 'lot-documents',
          files: proc.operator_files[lot.id],
          withHash: false,
          style     : 'margin: 5px 5px 0px 5px;'
        }
      );
    }

    //2013/08/16 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется
    lot.canceled_text = proc.canceled_text;
      if (proc.procedure_type != PROCEDURE_TYPE_PAPER_SINGLE_SUPPLIER) {
          items.push(Application.models.Lot.getLotDatesPanelItems(lot, proc, lotFields, lotTemplates));
      }
    var priceFields = {};
    priceFields.subject = 'Предмет договора:';
    priceFields.start_price = 'Начальная цена:';
    priceFields.currency_vocab ='Валюта:';
    if (Main.config.contracts_date_end_contract) {
      priceFields.date_end_contract = 'Срок заключения договора';
    }


    priceFields.guarantee_application = 'Размер обеспечения заявки:';
    priceFields.guarantee_contract = 'Размер обеспечения исполнения договора:';
    priceFields.guarantee_advance = 'Размер обеспечения возврата аванса:';
    priceFields.guarantee_warranty = 'Размер обеспечения гарантийных обязательств:';
    if (Main.config.warranty_payments) {
      priceFields.warranty_payments = 'Размер обеспечения обязательства по уплате любых платежей (за исключением авансовых), в т.ч. сумм неустоек';
    }
    if (Main.config.warranty_guarantee_period) {
      priceFields.warranty_guarantee_period = 'Обеспечение выполнения обязательств на период гарантийной эксплуатации';
    }
    if (Main.config.insurance_types) {
      priceFields.insurance_types = 'Условиями закупки предусмотрено страхование:';
    }

    var pricePanel = {
        xtype     : 'fieldset',
        title     : 'Цена договора и требования к обеспечению',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      pricePanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        fields        : priceFields,
        templates   : lotTemplates,
        fieldsShowAlways: ['guarantee_warranty', 'guarantee_advance'],
        values        : lot
      });
      items.push(pricePanel);

    if ( !Ext.isEmpty(lot.simple_preferences) && mode=='full') {
      reqPanel = {
        xtype     : 'fieldset',
        title     : 'Установлены преференции отдельным участникам',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      reqPanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotTemplates,
        fields: {
          simple_preferences: 'Перечень преференций: '
        },
        values        : lot
      });
      items.push(reqPanel);
    }

    if ( !Ext.isEmpty(lot.simple_evaluation_criteries) && mode=='full') {
      var simple_evaluation_criteries_text = 'Критерии оценки заявок на участие';
      if (proc.procedure_type == Application.models.Procedure.type_ids.quotation) {
        simple_evaluation_criteries_text = 'Критерии оценки предложений';
      }
      reqPanel = {
        xtype     : 'fieldset',
        title     : simple_evaluation_criteries_text,
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      reqPanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotTemplates,
        fields: {
          simple_evaluation_criteries : simple_evaluation_criteries_text + ': '
        },
        values        : lot
      });
      items.push(reqPanel);
    }

    if ( !Ext.isEmpty(lot.simple_requirements) && mode=='full') {
      reqPanel = {
        xtype     : 'fieldset',
        title     : 'Дополнительная информация для заявителей',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : [{
          xtype       : 'displayfield',
          hideLabel   : true,
          autoHeight  : true,
          border      : false,
          width       : '99%',
          style       : 'margin: 0px; padding: 0px;',
          value       : Ext.util.Format.nl2br(lot.simple_requirements)
        }]
      };

      items.push(reqPanel);
    }

    if ( !Ext.isEmpty(lot.lot_doc_requirements) && mode=='full') {
      reqPanel = {
        xtype     : 'fieldset',
        title     : 'Требуемая документация',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      reqPanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotTemplates,
        fields: {
          lot_doc_requirements : 'Перечень требуемых документов:'
        },
        values        : lot
      });
      items.push(reqPanel);
    }


    if ( !Ext.isEmpty(lot.lot_delivery_places) && mode=='full') {
      var placePanel = {
        xtype     : 'fieldset',
        title     : 'Условия поставки',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      placePanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        fields        : {
          quantity     : 'Объем поставки:',
          address   : 'Место поставки:',
          term         : 'Условия, сроки поставки и оплаты:'
        },

        values        : lot.lot_delivery_places[0]
      });
      items.push(placePanel);
    }

    if (Main.config.lot_doc_deadline || Main.config.lot_doc_providing_procedure || Main.config.lot_doc_payment_for_copy
        || Main.config.lot_doc_rights_duties || Main.config.lot_doc_site_url) {
      var docFieldPanel_fields = {};
      if (Main.config.lot_doc_deadline) docFieldPanel_fields.doc_deadline = 'Срок предоставления документации:';
      if (Main.config.lot_doc_providing_procedure) docFieldPanel_fields.doc_providing_procedure = 'Порядок предоставления документации:';
      if (Main.config.lot_doc_payment_for_copy) docFieldPanel_fields.doc_payment_for_copy = 'Плата за предоставление копии документации на бумажном носителе:';
      if (Main.config.lot_doc_rights_duties) docFieldPanel_fields.doc_rights_duties = 'Права и обязанности:';
      if (Main.config.lot_doc_site_url) docFieldPanel_fields.doc_site_url = 'Официальный сайт, на котором размещена документация:';
      var docFieldsPanel = {
        xtype     : 'fieldset',
        title     : 'Требования к документации',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };
      docFieldsPanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight    : true,
        border        : false,
        style         : 'margin: 0px; padding: 0px;',
        templates     : lotTemplates,
        fields        : docFieldPanel_fields,
        values        : lot
      });
      items.push(docFieldsPanel);

    }


    if ( !Ext.isEmpty(lot.doc_explains) && mode=='full') {
      var doc_explains_items = [];
      for (var de in lot.doc_explains) {
        if (lot.doc_explains.hasOwnProperty(de)) {
          doc_explains_items.push({html: '<div style="width: 90%;">' + lot.doc_explains[de].response_message + '</div>'});
          doc_explains_items.push({html: '<div style="width: 10%;"><a href="#com/procedure/showexplain/procedure/' + lot.procedure_id + '/lot/' + lot.id + '/reqid/' + lot.doc_explains[de].id + '">Подробнее</a></div>'});
        }
      }
      items.push({
        xtype: 'fieldset',
        layout: 'table',
        cls: 'keyvalue-panel-table',
        defaults: {
          bodyStyle: 'padding: 0 0 10px;'
        },
        title: 'Разъяснения документации к процедуре:',
        style: 'margin: 5px 5px 0px 5px; padding-bottom: 10px;',
        layoutConfig: {columns: 2},
        items: doc_explains_items
      });
    }

    if ( !Ext.isEmpty(lot.lot_customers) && mode=='full') {
      var customersPanel = {
        xtype     : 'fieldset',
        title     : 'Заказчики, с которыми заключается договор',
        style     : 'margin: 5px 5px 0px 5px; padding-bottom: 5px;',
        items     : []
      }

      for (var k in lot.lot_customers) {
        var customer = lot.lot_customers[k];
        if ( !Ext.isEmpty(customer.full_name) ) {

          // Контактные данные заказчика берутся из процедуры.
              customer.phone = proc.contact_phone;
              customer.email = proc.contact_email;
              customer.contact_fio = proc.contact_person;
              if (customer.addresses) {
                var addr_indexes = ['index', 'region', 'settlement', 'city', 'street', 'house'];
                for(var addr_ind in customer.addresses) {
                  var tmp_addr = [];
                  var addr = customer.addresses[addr_ind];
                  for(var jj in addr_indexes) {
                    if (addr[addr_indexes[jj]]) tmp_addr.push(addr[addr_indexes[jj]]);
                  }
                  customer.addresses[addr_ind].address_to_show = tmp_addr.join(', ');
                }
              }
          //}

          customersPanel.items.push({
            xtype         : 'panel',
            title         : customer.full_name,
            border        : true,
            cls           : 'spaced-bottom-shallow',
            items         : [{
              xtype         : 'Application.components.keyValuePanel',
              style         : 'margin: 0px 0px 5px 0px; padding: 10px;',
              fields        : {
                full_name     : 'Наименование заказчика:',
                contact_fio   : 'Контактное лицо:',
                email         : 'Адрес эл. почты:',
                phone         : 'Телефон:',
                website       : 'Сайт:',
                addresses     : 'Адрес местонахождения:'
              },
              templates     : {
                website   : '<a href="{website}">{website}</a>',
                // TODO: Преобразование адресов из ОКАТО в человекочитаемый формат.
                addresses : new Ext.XTemplate('<tpl for="addresses">'
                          + '{address_to_show} <tpl if="okato"><nobr>(код ОКАТО: {okato})</nobr></tpl><br />'
                          + '</tpl>')
              },
              values        : customer
            }]
          }); // customersPanel.items.push

        } // if !empty customer.full_name

      } // each lot.lot_customers

      items.push(customersPanel);
    } // if !empty lot.lot_customers

    if (proc.procedure_type == 17 && !Ext.isEmpty(lot.lot_units)  && mode=='full') {
      var posPanel = this.getPositionalPanel(lot);
      items.push(posPanel);
    }

    else if ( !Ext.isEmpty(lot.lot_units)  && mode=='full') {
      var unitsPanel = {
        xtype     : 'fieldset',
        title     : 'Перечень поставляемых товаров, выполняемых работ, оказываемых услуг',
        style     : 'margin: 5px; padding-bottom: 5px;',
        items     : []
      }

      for (k in lot.lot_units) {
        var unit = lot.lot_units[k];
        var positionId = parseInt(k) + 1;
          unit.priceWithoutNds = Application.models.Po_Procedure.getPriceWithoutNds(unit.price, unit.pos_nds);
          var unitPriceWithNds = Application.models.Po_Procedure.calcRealPriceWithNds(unit.price, unit.pos_nds);
          if (unit.pos_nds !== null) {
            unit.posNdsSum = Application.models.Po_Procedure.getSumNds(unitPriceWithNds * unit.quantity, unit.pos_nds);
          } else {
            unit.posNdsSum = "Без НДС";
          }

          unit.total_position = Application.models.Po_Procedure.getTotalPriceWithNds(
              unit.priceWithoutNds,
              unit.quantity,
              unit.pos_nds
          );
        if (lot.lot_units.hasOwnProperty(k) && !Ext.isEmpty(unit.name)) {
          unitsPanel.items.push({
            xtype         : 'panel',
            title         : 'Позиция ' + positionId,
            border        : true,
            cls           : 'spaced-bottom-shallow',
            items         : [{
              xtype         : 'Application.components.keyValuePanel',
              style: 'margin: 0px 0px 5px 0px; padding:10px;',
              fields        : function(){
                  var unitsPanelItemsFields = {
                      okved2_code     : 'Код ОКВЭД2',
                      okpd2_code      : 'Код ОКПД2',
                      name            : 'Наименование',
                      okei_symbol     : 'Единица измерения',
                      price_without_nds : t('Цена за единицу без НДС'),
                      quantity        : 'Количество',
                      pos_nds             : 'НДС',
                      pos_nds_sum     : 'Сумма НДС',
                      // До этого скрывалась при пост обработке. Скрыл сразу для упрощения логики.
                      // trademark       : 'Предпочтительная торговая марка:',
                      total_position  : 'Итого по позиции с учетом НДС',
                      requirements    : 'Минимально необходимые требования к товару/работе/услуге',
                      budget_article: 'Статья бюджета'
                  };

                  if(Main.config.lot_nomenclature_support){
                      unitsPanelItemsFields.okdp_code = 'Код ОКДП';
                  }
                  if(Main.config.lot_okved_support){
                      unitsPanelItemsFields.okved_code = 'Код ОКВЭД';
                  }
                  if (!Main.config.show_okpd2_and_okved2) {
                    delete unitsPanelItemsFields.okved2_code;
                    delete unitsPanelItemsFields.okpd2_code;
                  }
                  if(Main.config.lot_okpd_support){
                      unitsPanelItemsFields.okpd_code = 'Код ОКПД';
                  }

                  if (unit.total_position <= 0) {
                    delete unitsPanelItemsFields.total_position;
                  }

                  return unitsPanelItemsFields;
              }(),
              fieldsShowAlways: ['price_without_nds', 'requirements', 'budget_article', 'pos_nds_sum'],
              templates     : {
                'price_without_nds' : new Ext.XTemplate('<tpl if="values.price">'
                                +   '<div' +
                    ' class="lot-unit-price">{[values.priceWithoutNds]}'
                                + '</tpl>'
                                + '<tpl if="values.price==undefined">не указана</tpl>'),
                'pos_nds'       : new Ext.XTemplate('<tpl if="values.pos_nds">'
                                +   '{[Ext.util.Format.formatPrice(values.pos_nds)]} %</div>'
                                + '</tpl>'
                                + '<tpl if="values.pos_nds==undefined">не указан</tpl>'),
                'pos_nds_sum'   : new Ext.XTemplate('<tpl if="values.posNdsSum">'
                                +   '<div' +
                                ' class="lot-unit-nds-sum">{[Ext.util.Format.formatPrice(values.posNdsSum)]}'
                                + '</tpl>'
                                + '<tpl if="values.posNdsSum==undefined">не указана</tpl>'),
                'total_position'   : new Ext.XTemplate('<tpl if="values.total_position">'
                                +   '{[Ext.util.Format.formatPrice(values.total_position)]}'
                                + '</tpl>'
                                + '<tpl if="values.posNdsSum==undefined">не указана</tpl>'),
                'trademark'     : new Ext.XTemplate('<tpl if="values.trademark">{trademark}</tpl>'
                                + '<tpl if="!values.trademark">не указано</tpl>'),
                'requirements'  : new Ext.XTemplate('<tpl if="values.requirements!=undefined && values.requirements.length!=0">'
                                + '<ol class="lot-unit-requirements"><tpl for="requirements">'
                                +   '<tpl if="values.value!=undefined && values.type!=\'REQ\'"><li><b>{requirement}</b> ({type_vocab}): {value}</li></tpl>'
                                +   '<tpl if="values.type==\'REQ\'"><li><b>{requirement}</b> ({type_vocab})</li></tpl>'
                                + '</tpl></ol></tpl>'
                                + '<tpl if="values.simple_requirements">'
                                +   '<div class="lot-unit-requirements">{simple_requirements}</div>'
                                + '</tpl>'
                                + '<tpl if="(values.requirements==undefined || values.requirements.length==0) && values.simple_requirements==undefined ">'
                                + 'не указаны</tpl>'),
                  'budget_article' : new Ext.XTemplate('<tpl if="values.budget_article">{budget_article}</tpl>'
                      + '<tpl if="!values.budget_article">не указано</tpl>')
              },
              values        : unit
            }]
          }); // unitsPanel.items.push

        } // if !empty unit.name

      } // each lot.lot_units

      items.push(unitsPanel);
    }

    if ( !Ext.isEmpty(lot.nomenclature)  && mode=='full') {
      var nomenclaturePanel = {
        xtype     : 'fieldset',
        title     : 'Классификатор ОКДП',
        style     : 'margin: 5px; padding-bottom: 5px;',
        items     : []
      };

      for(var n=0; n<lot.nomenclature.length; n++) {
        nomenclaturePanel.items.push({
          html: lot.nomenclature[n].full_name
        });
      }
      items.push(nomenclaturePanel);
    }
    if ( !Ext.isEmpty(lot.okved)  && mode=='full') {
      var okvedPanel = {
        xtype     : 'fieldset',
        title     : 'Классификатор ОКВЭД',
        style     : 'margin: 5px; padding-bottom: 5px;',
        items     : []
      };

      for(var n=0; n<lot.okved.length; n++) {
        okvedPanel.items.push({
          html: lot.okved[n].full_name
        });
      }
      items.push(okvedPanel);
    }
    if ( !Ext.isEmpty(lot.okved2)  && mode=='full') {
      var okved2Panel = {
        xtype     : 'fieldset',
        title     : 'Классификатор ОКВЭД2',
        style     : 'margin: 5px; padding-bottom: 5px;',
        items     : []
      };

      for(var n=0; n<lot.okved2.length; n++) {
        okved2Panel.items.push({
          html: lot.okved2[n].full_name
        });
      }
      items.push(okved2Panel);
    }
    return items;
  },
  
  //Тип требования к характеристикам товара/услуги
  getRequirementTypeStore: function () {
    return new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['type', 'name'],
      idIndex: 0,
      data: [
        ['EXACT', 'Точное значение'],
        ['MIN', 'Не менее'],
        ['MAX', 'Не более'],
        ['MAX_AND_MIN', 'Между'],
        ['LOGICAL', 'Логический выбор'],
        ['REQ', 'Произвольный ввод'],
        ['LIST', 'Выбор из списка'],
        ['HIDDEN', 'Скрытое требование']
      ]
    });
  },
          
  getCurrentStep: function(lot) {
    var current_step_id = lot.current_step;
    var steps = lot.steps;
    if (current_step_id != undefined && steps != undefined){
      for (var i = 0; i<steps.length;i++) {
        if (steps[i]['id']==current_step_id) return steps[i];
      }
    }
    return null;
  },
  
  getCurrentStepPseudo: function(lot) {
    if (lot.lot_step) {
      return lot.lot_step;
    } else {
      var step = Application.models.Lot.getCurrentStep(lot);
      if (step) {
        return step.step_id;
      }
    }
    return null;
  },
  
  //Формат требования к характеристикам товара/услуги
  getRequirementFormatStore: function () {
    return new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['id', 'name'],
      idIndex: 0,
      data: [
        [1, 'Текст'],
        [2, 'Число'],
        [3, 'Дата'],
        [4, 'Дата и Время'],
        [6, 'Валюта']
      ]
    });    
  }

}