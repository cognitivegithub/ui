
Ext.define('Application.components.procedureBasicForm', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  parent: null,
  initComponent: function() {
    var component = this;
    var procedure_type_id = Ext.id(),
      auction_step_id = Ext.id(),
      auction_app_stages_id = Ext.id(),
      auction_offers_delay_id = Ext.id(),
      date_published_id = Ext.id(),
      date_end_registration_id = Ext.id(),
      date_end_first_parts_review_id = Ext.id(),
      date_begin_auction_id = Ext.id(),
      date_applic_opened_id = Ext.id(),
      date_itog_id = Ext.id(),
      applic_checkbox_id = Ext.id(),
      time_begin_auction_id = Ext.id(),
      remoteId_id = Ext.id(),
      purchase_method_id = Ext.id(),
      peretorg_possible_id = Ext.id(),
      commonfilepanel_id = Ext.id(),
      offers_step_min_id = Ext.id(),
      offers_step_max_id = Ext.id(),
      title_id = Ext.id(),
      total_steps_id = Ext.id(),
      private_access_id = Ext.id(),
      private_fieldset_id = Ext.id(),
      price_increase_id = Ext.id(),
      paper_form_reqs_id = Ext.id(),
      customer_agree_form_id = Ext.id(),
      send_oos_checkbox_id = Ext.id(),
      currency_id = Ext.id(),
      is_money_equivalent_id = Ext.id(),
      quotation_form_id = Ext.id(),
      //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
      auc_may_canceled_id = Ext.id(),
      date_may_canceled_id = Ext.id(),
      //2013/08/16 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется
      canceled_text_id = Ext.id();
      
    var only_auction_fields = [auction_step_id, auction_offers_delay_id, auction_app_stages_id];
    var retrade_and_auction_fields = [date_begin_auction_id, time_begin_auction_id];
    //var only_tender_fields = [date_applic_opened_id, date_itog_id];
    var all_dates_fields = [date_end_registration_id, date_applic_opened_id, date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id, date_itog_id, total_steps_id
                              //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
                              //2013/08/15 ptanya 3610 rel #41812 точная дата отказа уже не нужна
                              //, auc_may_canceled_id, //date_may_canceled_id
                              , auc_may_canceled_id, date_may_canceled_id, canceled_text_id
                            ];
    var date_fields = {
      auction_up: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id
                    //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
                    //2013/08/15 ptanya 3610 rel #41812 точная дата отказа уже не нужна
                    //, auc_may_canceled_id
                    , canceled_text_id
                  ],
      auction_down: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id],
      auction: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id],
      peretorg_reduc: [date_begin_auction_id, time_begin_auction_id],
      contest: [date_end_registration_id, date_applic_opened_id, date_end_first_parts_review_id, date_itog_id, total_steps_id],
      peretorg_contest: [date_end_registration_id, date_end_first_parts_review_id, date_itog_id],
      quotation: [date_end_registration_id, date_applic_opened_id, date_itog_id, total_steps_id],
      pricelist: [date_end_registration_id, date_itog_id],
      qualification: [date_end_registration_id, date_itog_id]
    };

    var end_reg_time = false;
    component.typesStore = Application.models.Procedure.getTypesStoreFromRPC();
    
    this.holidays = null;
    this.workdays = null;
    function setDisabledDates() {
      var iterator = 0;
      var start = new Date();
      var disabled_dates = [];
      while (true) {
        var tmpDate = start.add(Date.DAY, iterator);
        if (   (component.holidays && component.holidays.indexOf(tmpDate.format('d.m.Y'))!=-1)
            || (component.workdays && tmpDate.getDay()%6==0 && component.workdays.indexOf(tmpDate.format('d.m.Y'))==-1))
        {
          disabled_dates.push(tmpDate.format('d.m.Y'));
        };
        ++iterator;
        if (iterator>100) break;
      }
      Ext.getCmp(date_begin_auction_id).setDisabledDates(disabled_dates);
    }
    
    this.is_electronic = true;
    this.startDefinition = false;

    function parseHour(str) {
      var instr = new String(str);
      var tmp = instr.split('T');
      var time_tmp = tmp[1].split(":");
      return time_tmp[0];
    }

    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
    this.addEvents('addcustomer');
    this.addEvents('oosstate');
    this.addEvents('peretorg');
    this.addEvents('peretorg_init');
    this.addEvents('onEditing');

    var notifier = function(event) {
      return function() {
        if (this.isValid()) {
          var cur_value = this.getValue();
          this.fireEvent(event, cur_value);
        }
      };
    };    

    this.trade_step_exact = false;
    if (!(component.frm && component.frm=='peretorg') && Main.config && Main.config.trade && Main.config.trade.step_is_exact) {
      this.trade_step_exact = true;
    }
    this.max_trade_step = 999999;

    var ossCheckHandler = function(cmp) {
      var visible = cmp.getValue() && !cmp.hidden;
      var purchase_method = Ext.getCmp(purchase_method_id);
      if (!purchase_method.customerDisabled) {
        purchase_method.setVisible(visible);
        if (!visible) {
          purchase_method.setValue(null);
        }
      }
      this.fireEvent('oosstate', cmp.getValue());
    }.createDelegate(this);
    var moneyCheckHandler = function(cmp) {
      var currency = Ext.getCmp(currency_id);
      if (cmp.checked) {
        currency.enable();
      } else {
        currency.disable();
        currency.setValue(810);
      }

      this.fireEvent('lotpricechanged', cmp.checked);
    }

    Ext.apply(this, {
      labelWidth: 300,
      defaults: {
        anchor: '100%',
        defaults: {
          border: false,
          anchor: '100%',
          labelWidth: 300,
          allowBlank: false
        }
      },
      bodyCssClass: 'subpanel',
      items: [{
        xtype: 'fieldset',
        title: 'Сведения о процедуре',
        items: [/*{
          fieldLabel: 'Адрес электронной торговой площадки в сети "Интернет"',
          html: 'http://roseltorg.ru'
        }, */{
          fieldLabel: 'Форма торгов',
          xtype: 'Application.components.combo',
          id: procedure_type_id,
          store: component.typesStore,
          hiddenRecordField: 'hidden',
          displayField: 'name',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          //mode: 'local',
          emptyText: 'Выберите форму торгов',
          hiddenName: 'procedure_type',
          name: 'procedure_type',
          listeners: {
            select: function(combo, value) {
              component.procedureDateSettings = component.typesStore.getById(value.data.id).data ;
              Ext.getCmp(date_published_id).fireEvent('typeComboLoaded');
              component.fireEvent('procedurechanged', value.data.id);
            },
            beforerender : function (combo) {
              component.typesStore.load({callback: function() {
                combo.setValue(Main.config.basic_proc_type);
                component.procedureDateSettings = component.typesStore.getById(Main.config.basic_proc_type).data ;
                Ext.getCmp(date_published_id).fireEvent('typeComboLoaded');
              }});
            }
          }
        }, {
          boxLabel: 'возможность проведения процедуры переторжки',
          xtype: 'checkbox',
          name: 'peretorg_possible',
          id: peretorg_possible_id,
          value: false
        }, {
          fieldLabel: 'Номер извещения',
          html: 'Генерируется после публикации',
          name: 'registry_number'
        }, {
          fieldLabel: 'Номер процедуры',
          name: 'remote_id',
          id: remoteId_id,
          html: '&nbsp;',
          hidden: true
        }, {
          xtype: 'textarea',
          name: 'title',
          height: 50,
          id: title_id,
          autoScroll: true,
          fieldLabel: 'Наименование процедуры'+REQUIRED_FIELD
        }, {
          fieldLabel: 'Цена лота выражена в денежном эквиваленте' + renderTip('В случае снятия галочки, валюта не будет установлена и применяется неденежное выражение цены в соответствии с документацией по процедуре'),
          xtype: 'checkbox',
          name: 'is_money_equivalent',
          id: is_money_equivalent_id,
          hidden: !Main.config.money_equivalent_configurable,
          checked: this.value?this.value.is_money_equivalent:true,
            listeners: {
              beforerender : function() {
                Ext.getCmp(component.parent.id).relayEvents(this, ['lotpricechanged']);
              },
              afterrender: moneyCheckHandler,
              check: moneyCheckHandler
            }
        }, {
          xtype: 'Application.components.combo',
          fieldLabel: 'Валюта процедуры',
          store: getCurrencyStore(),
          valueField: 'id',
          id: currency_id,
          displayField: 'description',
          name: 'currency',
          hiddenName: 'currency_val',
          value: this.value?this.value.currency:810,
          mode: 'local',
          editable: false,
          triggerAction: 'all',
          renderer: function(values) {
            return Ext.util.Format.countryFlag(values.alpha2||values.alpha3)+' '+values.description;
          },
          listeners: {
            beforerender: function() {
              var st = this.getStore();
              st.on('load', function(){
                this.setValue(this.value);
              }, this, {once: true});
            }
          }
        },
          {
            fieldLabel: 'Передать сведения о процедуре в ЕИС',
            xtype: 'checkbox',
            name: 'send_to_oos',
            id: send_oos_checkbox_id,
            hidden: !Main.contragent.oos_send,
            disabled: !Main.contragent.oos_send,
            checked: Main.contragent.oos_send,
            listeners: {
              afterrender: ossCheckHandler,
              check: ossCheckHandler
            }
          },
          {
            xtype: 'Application.components.combo',
            fieldLabel: 'Способ закупки по классификатору ЕИС',
            store: getPurchaseMethodStore(true),
            id: purchase_method_id,
            valueField: 'code',
            displayField: 'name',
            name: 'purchase_method_code',
            hiddenName: 'purchase_method_code',
            mode: 'local',
            editable: false,
            customerDisabled: false,
            triggerAction: 'all',
            listWidth: 600,
            tooltipTpl: '{name}',
            qtipConfig: {
              html: 'При выборе способа закупки обратите внимание на то, чтобы он был включен Вами в ЕИС' +
              ' в Положение о закупках. После обновления версии ЕИС интеграция стала возможна,' +
              ' только если способ закупки присутствует в Положении о закупках. Слева от наименования' +
              ' способа в списке выведен его порядковый номер и код в ЕИС, а также значок (+) или (-),' +
              ' чтобы Вы могли ориентироваться при проверке. Порядковый номер Вы можете видеть в справочнике' +
              ' Способы закупки в ЛК в ЕИС в соответствующей колонке. Код виден в адресной строке браузера' +
              ' при просмотре данного способа закупки в ЛК в ЕИС. Знак (+) означает, что способ закупки' +
              ' включен в Положение о закупках, а (-) - что у нас нет данных о его включении в Положение.' +
              ' Информация о Положении о закупках обновляется в рамках ежесуточной выгрузки.' +
              ' Пожалуйста, будьте внимательны при выборе способа закупки.',
              autoHide: false,
              applyTipTo: 'label'
            },
            plugins: [Ext.ux.plugins.ToolTip ],
            listeners: {
              beforerender: function(cmp) {
                if (!cmp.hidden) {
                  cmp.getStore().load({
                    callback: function() {
                      cmp.setValue(cmp.getValue());
                    }
                  });
                }
              }
            }
          }
        ]
      }, {
        xtype: 'Application.components.ProcedureSubjectCodesPanel',
        title: 'Код предмета закупки',
        hidden: !Main.config.subject_code,
        name: 'procedure_subject_codes'
      }, {
        xtype: 'Application.components.ProcedureInnerClassificationPanel',
        title: 'Внутренний классификатор',
        hidden: !Main.config.inner_classification,
        name: 'procedure_inner_classification'
      }, {
        xtype: 'fieldset',
        title: 'Сведения об организаторе',
        items: [{
          fieldLabel: 'Наименование организации',
          html: Main.contragent.full_name
        /*}, {
          fieldLabel: 'Тип организации',
          html: Main.contragent.customer_status||'Заказчик'*/
        }, {
          fieldLabel: 'Местонахождение',
          html: Main.contragent.legal_address||'-'
        }, {
          fieldLabel: 'Почтовый адрес организатора',
          html: Main.contragent.postal_address||'-'
        }, {
          xtype: 'Application.components.phonePanel',
          name: 'contact_phone',
          fieldLabel: 'Контактный телефон'+REQUIRED_FIELD,
          value: Main.user.user_phone
        }, {
          xtype: 'textfield',
          name: 'contact_fax',
          fieldLabel: 'Факс',
          hidden: !Main.config.procedure_contact_fax,
          allowBlank: true
        }, {
          xtype: 'textfield',
          vtype: 'email',
          name: 'contact_email',
          fieldLabel: 'Адрес эл. почты'+REQUIRED_FIELD,
          value: Main.contragent.email
        }, {
          xtype: 'textfield',
          fieldLabel: 'Контактное лицо'+REQUIRED_FIELD,
          name: 'contact_person',
          value: Main.user.full_name
        }, {
          xtype: 'textfield',
          fieldLabel: 'Место рассмотрения предложений'+REQUIRED_FIELD,
          name: 'review_applics_city',
          hidden: !Main.config.review_applics_city,
          value: Main.contragent.postal_city
        }]
      }, {
        xtype: 'fieldset',
        title: 'Свойства процедуры',
        labelWidth: 400,
        items: [
        {
          fieldLabel: 'Разрешить подачу заявок всем заявителям',
          xtype: 'checkbox',
          name: 'all_applics_allowed',
          id: applic_checkbox_id,
          hidden: true
        },
        {
          fieldLabel: 'Принимать предложения только на повышение',
          xtype: 'checkbox',
          name: 'price_increase',
          id: price_increase_id,
          hidden: true,
          disabled: true
        },
        {
          fieldLabel: 'Принимать заявки в бумажной форме',
          xtype: 'checkbox',
          name: 'paper_form',
          id: paper_form_reqs_id,
          hidden: true, //!Main.contragent.special_cab,
          disabled: !Main.contragent.special_cab
        },
        {
          fieldLabel: 'Форма согласия принимается по установленной заказчиком форме',
          xtype: 'checkbox',
          name: 'customer_agree_form',
          id: customer_agree_form_id,
          hidden: !Main.contragent.special_cab,
          disabled: !Main.contragent.special_cab
        }, {
          fieldLabel: 'Количество этапов процедуры',
          name: 'total_steps',
          id: total_steps_id,
          xtype: 'Application.components.numberField',
          hidden: !Main.config.addstep_support
        },
        {
          fieldLabel: 'Порядок рассмотрения заявок',
          id: auction_app_stages_id,
          xtype: 'combo',
          editable: false,
          triggerAction: 'all',
          mode: 'local',
          store: [[1, 'Заявки в одной части'], [2, 'Заявки в двух частях (аналогично 94-ФЗ)']],
          value: 1,
          name: 'application_stages',
          listeners: {
            select: function(combo) {
              component.fireEvent('stageschanged', combo.getValue());
            }
          }
        }, {
          fieldLabel: 'Время ожидания ценовых предложений (минут)'+REQUIRED_FIELD,
          width: 80,
          anchor: false,
          id: auction_offers_delay_id,
          xtype: 'numberfield',
          name: 'offers_wait_time',
          allowNegative: false,
          allowDecimals: false,
          readOnly: (component.frm &&component.frm=='peretorg') ? true: false,
          minValue: (component.frm &&component.frm=='peretorg') ? 60:5,
          maxValue: 1440,
          value: (component.frm &&component.frm=='peretorg') ? 60:10
        }, {
          fieldLabel: 'Шаг ценовых предложений, ' + (this.trade_step_exact ? 'валюта договора' : '%') + REQUIRED_FIELD,
          xtype: 'compositefield',
          msgTarget: 'under',
          cls: 'cleanbackground',
          id: auction_step_id,
          defaults: {
            xtype: this.trade_step_exact?'Application.components.priceField':'Application.components.percentField',
            allowNegative: false,
            allowDecimals: true,
            allowBlank: false,
            decimalPrecision: this.trade_step_exact?2:4,
            minValue: this.trade_step_exact?0.01:0.0001
          },
          items: [{
            xtype: 'displayfield',
            html: 'от '
          }, {
            fieldLabel: 'Минимальный шаг',
            value: this.trade_step_exact?1:((component.frm &&component.frm=='peretorg') ? 0:0.5),
            maxValue: this.trade_step_exact?this.max_trade_step:((component.frm && component.frm=='peretorg') ?100:10),
            readOnly: (component.frm &&component.frm=='peretorg') ? true: false,
            width: 80,
            anchor: false,
            name: 'offers_step_min',
            id: offers_step_min_id
          }, {
            xtype: 'displayfield',
            html: ' до '
          }, {
            fieldLabel: 'Максимальный шаг',
            value: this.trade_step_exact?1000:((component.frm &&component.frm=='peretorg') ?100:1),
            readOnly: (component.frm &&component.frm=='peretorg') ? true: false,
            name: 'offers_step_max',
            id: offers_step_max_id,
            width: 80,
            anchor: false,
            maxValue: this.trade_step_exact?this.max_trade_step:((component.frm && component.frm=='peretorg') ?100:50)
          }]
        }, {
            xtype: 'textfield',
            fieldLabel: 'Форма котировочной заявки' + renderTip('Укажите вид, в котором должна быть подана заявка (бумажный вид или в форме электронного документа)'),
            name: 'quotation_form',
            hidden: true,
            id: quotation_form_id
        }, {
          fieldLabel: 'Дата публикации процедуры'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_published_id,
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: 'date_published',
          width: 200,
          value: now(),
          editable: false,
          minValue: new Date(),
          listeners: {
            beforerender : function() {
              this.addEvents('typeComboLoaded');
            },
            select: function() {
              Ext.getCmp(date_end_registration_id).makeDateDisabling(this.getValue(), 'applic_publish', component.procedureDateSettings);
            },
            valueFilled: function(v) {
              Ext.getCmp(date_end_registration_id).makeDateDisabling(v, 'applic_publish', component.procedureDateSettings);
            },
            typeComboLoaded : function() {
              Ext.getCmp(date_end_registration_id).makeDateDisabling(this.getValue(), 'applic_publish', component.procedureDateSettings);
            }
          }
        }, {
          fieldLabel: 'Дата и время окончания срока подачи заявок, предложений'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_end_registration_id,
          format: 'd.m.Y H:i',
          altFormats: 'c|d.m.Y H:i|d.m.Y g:i',
          anchor: null,
          name: 'date_end_registration',
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('regDateSelected');
            },
            select: function() {
              var cur_value = this.getValue();
              var hour = 21;
              if (end_reg_time) {
                hour = end_reg_time;
              }
              var date = new Date(this.getValue()).add(Date.HOUR, hour);
              this.setValue(date.format('d.m.Y H:i'));
            },
            change: notifier('regDateSelected'),
            valueFilled: function(v) {
              this.fireEvent('regDateSelected', v);
            }
          }
        }, {
          fieldLabel: 'Дата и время окончания срока публикации протокола вскрытия конвертов'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_applic_opened_id,
          format: 'd.m.Y H:i',
          altFormats: 'c|d.m.Y H:i|d.m.Y g:i',
          anchor: null,
          name: 'date_applic_opened',
          width: 200,
          listeners: {
            beforerender : function() {
              if(Main.config.applic_opened_visible) {
                this.addEvents('regDateSelected');
                this.relayEvents(Ext.getCmp(date_end_registration_id), ['regDateSelected']);
              }
            },
            regDateSelected : function(v) {
              this.makeDateDisabling(v, 'applic_opened', component.procedureDateSettings);
            },
            select: function() {
              var cur_value = this.getValue();
              var date = new Date(cur_value).add(Date.HOUR, 12);
              this.setValue(date.format('d.m.Y H:i'));
            },
            change: notifier('reviewBaseDateSelected'),
            valueFilled: function(v) {
              this.fireEvent('reviewBaseDateSelected', v);
            }
          }
        }, {
          fieldLabel: 'Дата окончания срока рассмотрения заявок, предложений'+REQUIRED_FIELD+':',
          labelSeparator: '',
          xtype: 'Application.components.dateField',
          id: date_end_first_parts_review_id,
          format: 'd.m.Y H:i',
          altFormats: 'c|d.m.Y H:i|d.m.Y g:i',
          anchor: null,
          name: 'date_end_first_parts_review',
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('regDateSelected');
              this.addEvents('reviewBaseDateSelected');
              this.addEvents('beginBaseDateSelected');
              this.addEvents('itogBaseDateSelected');
              this.relayEvents(Ext.getCmp(date_end_registration_id), ['regDateSelected']);
              this.relayEvents(Ext.getCmp(date_applic_opened_id), ['reviewBaseDateSelected']);
            },
            regDateSelected : function(v) {
              if(!Main.config.applic_opened_visible) {
                if(component.procedure_type_id==Application.models.Procedure.type_ids.contest) {
                  v=component.calculateDateOpened(v);
                  v=v.add(Date.MINUTE, 3);
                }
              }
              this.makeDateDisabling(v, 'end_firstparts', component.procedureDateSettings);
            },
            reviewBaseDateSelected : function(v) {
              this.makeDateDisabling(v, 'end_firstparts', component.procedureDateSettings);
            },
            select: function() {
              var date = new Date(this.getValue());
              date = date.add(Date.HOUR, 23);
              date = date.add(Date.MINUTE, 59);
              this.setValue(date);
            },
            change: function() {
              if (!this.isValid()) {
                return;
              }
              var date = this.getValue();
              if(component.procedure_type_id==Application.models.Procedure.type_ids.auction_up
                || component.procedure_type_id==Application.models.Procedure.type_ids.auction_down) {
                this.fireEvent('beginBaseDateSelected', date);
              } else {
                this.fireEvent('itogBaseDateSelected', date);
              }
            },
            valueFilled: function(v) {
              if(component.procedure_type_id==Application.models.Procedure.type_ids.auction_up
                || component.procedure_type_id==Application.models.Procedure.type_ids.auction_down) {
                this.fireEvent('beginBaseDateSelected', v);
              } else {
                this.fireEvent('itogBaseDateSelected', v);
              }
            }
          }
        }, {
          fieldLabel: 'Дата проведения (для аукционов)'+REQUIRED_FIELD+':',
          labelSeparator: '',
          xtype: 'Application.components.dateField',
          id: date_begin_auction_id,
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          editable: false,
          name: 'date_begin_auction',
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('beginBaseDateSelected');
              this.addEvents('itogBaseDateSelected');
              this.relayEvents(Ext.getCmp(date_end_first_parts_review_id), ['beginBaseDateSelected']);
            },
            beginBaseDateSelected : function(v) {
              this.makeDateDisabling(v, 'begin_auction', component.procedureDateSettings);
            },
            change: notifier('itogBaseDateSelected'),
            valueFilled: function(v) {
              this.fireEvent('itogBaseDateSelected', v);
            }
          }
        }, {
          fieldLabel: 'Время проведения'+REQUIRED_FIELD+':',
          labelSeparator: '',
          xtype: 'timefield',
          id: time_begin_auction_id,
          format: 'H:i',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: 'time_begin_auction',
          width: 200
        }, {
          fieldLabel: 'Дата подведения итогов'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_itog_id,
          format: 'd.m.Y',
          anchor: null,
          name: 'date_end_second_parts_review',
          editable: false,
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('itogBaseDateSelected');
              this.addEvents('regDateSelected');
              this.relayEvents(Ext.getCmp(date_end_registration_id), ['regDateSelected']);
              this.relayEvents(Ext.getCmp(date_end_first_parts_review_id), ['itogBaseDateSelected']);
              this.relayEvents(Ext.getCmp(date_begin_auction_id), ['itogBaseDateSelected']);
            },
            regDateSelected : function(v) {
              if(!Main.config.applic_opened_visible) {
                if(component.procedure_type_id==Application.models.Procedure.type_ids.quotation) {
                  v=component.calculateDateOpened(v);
                  v=v.add(Date.MINUTE, 3);
                }
              }
              this.makeDateDisabling(v, 'end_secondparts', component.procedureDateSettings);
            },
            itogBaseDateSelected : function(v) {
              this.makeDateDisabling(v, 'end_secondparts', component.procedureDateSettings);
            },
            select: function() {
              var date = new Date(this.getValue()).add(Date.HOUR, 23);
              date.add(Date.MINUTE, 59);
              this.setValue(date);
            }
          }
        //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
        }, {
          fieldLabel: 'Возможный отказ от проведения процедуры',
          id: auc_may_canceled_id,
          xtype: 'checkbox',          
          listeners: {
            beforerender : function() {
              this.addEvents('mayCanceledDateSelected');              
              this.relayEvents(Ext.getCmp(date_may_canceled_id), ['mayCanceledDateSelected']);
            },
            mayCanceledDateSelected: function(v) {
              if (v) {
                this.setValue(true);
              } else {
                this.setValue(false);
              }
            },
            check: function(field, newVal) {
              var date_may_canceled = Ext.getCmp(date_may_canceled_id);
              if (!date_may_canceled) {
                return;
              }
              if (newVal) {
                date_may_canceled.enable();
                date_may_canceled.show();
                component.doLayout();
              } else {
                date_may_canceled.disable();
                date_may_canceled.hide();
              }
            }
          }          
        }, {
          fieldLabel: 'Дата возможного отказа от проведения процедуры:',
          labelSeparator: '',
          xtype: 'Application.components.dateField',
          id: date_may_canceled_id,
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: 'date_may_canceled',
          width: 200,
          editable: false,
          minValue: new Date(),
          hidden: true,
          listeners: {
            beforerender : function() {
              this.addEvents('mayCanceledDateSelected');
            },
            valueFilled: function(v) {
              this.fireEvent('mayCanceledDateSelected', v);
            }
          }          
        }, {
          //2013/08/16 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется
          xtype: 'textarea',
          name: 'canceled_text',
          height: 50,
          id: canceled_text_id,
          autoScroll: true,
          allowBlank: true,
          fieldLabel: 'Отказ от проведения процедуры'
        },{
            xtype: 'textfield',
            fieldLabel: 'Форма котировочной заявки' + renderTip('Укажите вид, в котором должна быть подана заявка (бумажный вид или в форме электронного документа)'),
            name: 'quotation_form',
            hidden: true,
            id: quotation_form_id
          }]
      }, {
        xtype: 'fieldset',
        title: 'Документация процедуры',
        hidden: !Main.config.common_files,
        items: [
          {
            html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                  ACCEPTED_FILES+'.',
            cls: 'spaced-bottom-shallow'
          },
          {
            id: commonfilepanel_id,
            xtype: 'Application.components.multiuploadPanel',
            uploadHandler: RPC.Procedure.addFile,
            deleteHandler: RPC.Procedure.removeFile,
            name: 'common_files',
            simultaneousUpload: true,
            autoUpload: true,
            width: 750,
            listeners: {
              beforeupload: function(cmp) {
                cmp.uploadParams.procedure_id = component.parent?(component.parent.procedure_id||0):0;
                cmp.uploadParams.type=3;
              },
              uploadcomplete: function(result, action) {
                if (result.success
                    && result.procedure_id
                    && component.parent
                    && result.procedure_id!=component.parent.procedure_id)
                {
                  component.parent.fireEvent('idchanged', result.procedure_id);
                }
              }
            }
          }
        ]
      }, {
        xtype: 'fieldset',
        title: 'Доступ к процедуре',
        id: private_fieldset_id,
        items: [{
          xtype: 'radiogroup',
          columns: 1,
          hideLabel: true,
          name: 'private',
          items: [{boxLabel: 'Для всех', checked: true, inputValue: 'public', name: 'procedure_private_checkbox'},
                  {boxLabel: 'Для ограниченного круга заявителей', inputValue: 'private', name: 'procedure_private_checkbox'}],
          getValues: function() {
            var v = this.getValue();
            v = v.inputValue;
            return v=='private';
          },
          setValues: function(v) {
            if (v) {
              this.setValue('private');
            } else {
              this.setValue('public');
            }
          },
          listeners: {
            change: function(group, checked) {
              var cmp = Ext.getCmp(private_access_id);
              if ('private'==checked.inputValue) {
                cmp.enable();
              } else {
                cmp.disable();
              }
            }
          }
        }, {
          hideLabel: true,
          disabled: true,
          xtype: 'Application.components.contragentsSelectForm',
          title: 'Укажите список заявителей, которым будет разрешен доступ к данной процедуре:',
          id: private_access_id,
          name: 'private_access',
          items: [{
            layout: 'form',
            labelWidth: 250,
            items: [{
              anchor: '100%',
              xtype: 'Application.components.procedureFindCombo',
              hideTrigger: false,
              pageSize : 20,
              editable: false,
              triggerAction: 'all',
              storeBaseParams: {
                own: 1,
                status: Application.models.Procedure.statuses.archive,
                procedure_type: Application.models.Procedure.type_ids.qualification
              },
              emptyText: 'Выберите процедуру для автоматического заполнения списка заявителей',
              fieldLabel: 'Выбрать заявителей, прошедших квалификационный отбор по процедуре',
              listeners: {
                select: function(combo, record) {
                  RPC.Applic.reviewlist({lot_id: record.data.lots, stage: 2}, function(resp){
                    if (!resp || !resp.success) {
                      echoResponseMessage(resp);
                      return;
                    }
                    if (!resp.applications) {
                      return;
                    }
                    var cmp = Ext.getCmp(private_access_id);
                    if (!cmp) {
                      return;
                    }
                    var data = [];
                    for (var i=0; i<resp.applications.length; i++) {
                      if (resp.applications[i].accepted<=0) {
                        continue;
                      }
                      data.push({
                        inn: resp.applications[i].supplier_inn,
                        kpp: resp.applications[i].supplier_kpp,
                        email: resp.applications[i].supplier,
                        email_unset: true
                      });
                    }
                    cmp.setValues(data);
                  });
                }
              }
            }]
          }]
        }]
      }, {
        xtype: 'Application.components.ProcedureCoordination',
        title: 'Согласование извещения',
        parent: component.parent,
        hidden: !Main.config.procedure_coordination
      }],
      listeners : {
         peretorg: function(frm,stage) {
          this.stage = stage;
          this.frm = frm;
          if(stage>0 && frm=='dotorg') {
            Ext.getCmp(applic_checkbox_id).show();
          } else {
            Ext.getCmp(applic_checkbox_id).hide();
          }
        },
        peretorg_init : function() {
          var typesStore = Application.models.Procedure.getPeretorgTypesStore();
          typesStore.load();
          Ext.getCmp(procedure_type_id).store = typesStore;
        }
      },
      getValues: function() {
        var dt=null;
        var v = {organizer_contragent_id: this.organizer_contragent_id};
        collectComponentValues(this, v, true);
        v.procedure_type = component.procedure_type_id;
        v.step_is_exact = this.trade_step_exact;
        if (v.time_begin_auction && v.date_begin_auction) {
          var time = v.time_begin_auction.split(':');
          v.date_begin_auction.setHours(time[0]);
          v.date_begin_auction.setMinutes(time[1]);
          v.date_begin_auction.setSeconds(0);
          v.date_begin_auction.setMilliseconds(0);
          v.time_begin_auction = true;
        } else {
          v.time_begin_auction = false;
        }
        if (v.date_end_second_parts_review) {
          v.date_end_second_parts_review = v.date_end_second_parts_review.add(Date.MINUTE, 23*60 + 59);
        }

        if(!Main.config.applic_opened_visible) {
          if(v.procedure_type==Application.models.Procedure.type_ids.contest ||
             v.procedure_type==Application.models.Procedure.type_ids.quotation)  {
             dt=Ext.getCmp(date_end_registration_id).getValue();
             v.date_applic_opened = component.calculateDateOpened(dt);
          }
        }

        if(v.procedure_type==Application.models.Procedure.type_ids.peretorg_reduc) {
          v.offers_wait_time = 60;
          v.offers_step_min = 0.0001;
          v.offers_step_max = 100;
        }
        var steps = Application.models.Procedure.mapDatesToSteps(v, component.steps, null, component.procedure_type_id);
        v.steps = Ext.util.JSON.encode(steps);
        return v;
      },
      calculateDateOpened: function(dt) {
        if (typeof dt == 'string') {
          dt = parseDate(dt);
        }
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setSeconds(1);
        dt.setMilliseconds(0);
        dt = dt.add(Date.DAY, 1);
        dt = dt.add(Date.MINUTE, 23*60 + 59);
        return dt;
      },
      setValues:function(v) {
        component.startDefinition = true;
        if(v.date_end_registration) {
          end_reg_time = parseHour(v.date_end_registration);
        }
        if (v.date_begin_auction && v.time_begin_auction) {
          v.date_begin_auction = parseDate(v.date_begin_auction);
          v.time_begin_auction = v.date_begin_auction.format('H:i');
          v.date_begin_auction.setHours(0);
          v.date_begin_auction.setMinutes(0);
          v.date_begin_auction.setSeconds(0);
          v.date_begin_auction.setMilliseconds(0);
        }
        if (!v.time_begin_auction) {
          v.time_begin_auction = null;
        }
        if (v.date_published) {
          var date_now = new Date();
          var saved_date = parseDate(v.date_published);
          Ext.getCmp(date_published_id).setMinValue(date_now < saved_date ? date_now : saved_date);
        }
        var remoteId = Ext.getCmp(remoteId_id);
        if (v.remoteId||v.remote_id) {
          remoteId.show();
          remoteId.update(v.remoteId||v.remote_id);
          component.doLayout();
        } else {
          remoteId.hide();
        }
        setComponentValues(this, v, true);
        if (v.procedure_type) {
          this.fireEvent('procedurechanged', Number(v.procedure_type), v.current_stage_number);
        }
        if (v.is_money_equivalent != null) {
          this.fireEvent('lotpricechanged', v.is_money_equivalent);
        }
        if (v.application_stages) {
          this.fireEvent('stageschanged', Number(v.application_stages));
        }
        if (v.stage>0) {
          if(v.frm=='peretorg') {
            Ext.getCmp(procedure_type_id).setValue(v.procedure_type);
            Ext.getCmp(title_id).setReadOnly(true);
            Ext.getCmp(title_id).addClass('x-readonly');
            Ext.getCmp(send_oos_checkbox_id).disable();
            Ext.getCmp(send_oos_checkbox_id).hide();
            Ext.getCmp(purchase_method_id).disable();
            Ext.getCmp(purchase_method_id).hide();
            this.fireEvent('peretorg_init');
          }
          this.fireEvent('peretorg', v.stage);
        }
        if(Application.models.Procedure.groups.paper_forms.indexOf(v.procedure_type)>=0) {
          component.is_electronic = false;
        }
        if(null!=v.date_published && v.version && v.version>=1) {
          Ext.getCmp(procedure_type_id).disable();
          Ext.getCmp(date_published_id).setReadOnly(true);
          Ext.getCmp(send_oos_checkbox_id).hide();
          Ext.getCmp(purchase_method_id).hide();
          if (!v.oos_publish_status && !v.purchase_method_code && v.send_to_oos) {
            Ext.getCmp(send_oos_checkbox_id).setValue(false);
          }
          this.fireEvent('onEditing');
        }
        if(v.common_files) {
          Ext.getCmp(commonfilepanel_id).setValues(v.common_files);
        }
        if (v.peretorg_possible && Main.config.peretorg_possible_field) {
          var peretorg_possible_field = Ext.getCmp(peretorg_possible_id);
          if (peretorg_possible_field && v.peretorg_possible == 'есть') {
            peretorg_possible_field.setValue(true);
          }
        }
        if (v.show_hint && v.show_hint==true) {
          Ext.MessageBox.alert("Внимание!", "В соответствии с ч. 11 ст. 4 223-ФЗ в случае, если закупка осуществляется путем проведения торгов и изменения в извещение о закупке, документацию о закупке внесены заказчиком позднее чем за пятнадцать дней до даты окончания подачи заявок на участие в закупке, срок подачи заявок на участие в такой закупке должен быть продлен так, чтобы со дня размещения на официальном сайте внесенных в извещение о закупке, документацию о закупке изменений до даты окончания подачи заявок на участие в закупке такой срок составлял не менее чем пятнадцать дней.");
        }
        var steps = (v.steps) ? Ext.util.JSON.decode(v.steps) : Application.models.Procedure.getType(v.procedure_type+'').steps;
        component.steps = steps;
      }
    });
    this.listeners = this.listeners||{};

    this.procedureTypeChanged = function(p, current_stage) {
      var auc_visible = false;
      var auc_and_retrade_visible = false;
      var visible = false;
      var item, i;
      var type = Application.models.Procedure.type_ids[''+p];

      if (Application.models.Procedure.groups.auctions.indexOf(p)>=0)
      {
        auc_visible = true;
        auc_and_retrade_visible = true;
      }
      if(Application.models.Procedure.groups.retrades.indexOf(p)>=0) {
        auc_visible = false;
      }
      var stages = Ext.getCmp(auction_app_stages_id);
      if (!auc_and_retrade_visible && 2==stages.getValue()) {
        stages.setValue(1);
        stages.fireEvent('select', stages, stages.getValue());
      }
      for (i=0; i<only_auction_fields.length; i++) {
        item = Ext.getCmp(only_auction_fields[i]);
        item.setDisabled(!auc_visible);
        if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_only_two_stages != false
              && only_auction_fields[i] == auction_app_stages_id) {
          item.setVisible(false);
          item.setValue(2);
          item.fireEvent('select', item, item.getValue());
        } else if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_offers_delay != 0
              && only_auction_fields[i] == auction_offers_delay_id) {
          item.setVisible(false);
          item.setValue(Main.config.reduction_offers_delay);
        } else if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_offers_step_min != 0
              && Main.config.reduction_offers_step_max != 0
              && only_auction_fields[i] == auction_step_id) {
          item.setVisible(false);
          Ext.getCmp(offers_step_min_id).setValue(Main.config.reduction_offers_step_min);
          Ext.getCmp(offers_step_max_id).setValue(Main.config.reduction_offers_step_max);
        } else {
          item.setVisible(auc_visible);
        }
      }
      if (p==Application.models.Procedure.type_ids.auction_up_26) {
        item = Ext.getCmp(auction_app_stages_id);
        item.setVisible(false);
        item.setValue(1);
        item.fireEvent('select', item, item.getValue());
      }
      var price_increase_checkbox = Ext.getCmp(price_increase_id);

      if(p==Application.models.Procedure.type_ids.contest && Main.config.support_price_increase_contest) {
        price_increase_checkbox.enable();
        price_increase_checkbox.show();
      } else {
        price_increase_checkbox.disable();
        price_increase_checkbox.hide();
      }

      for (i=0; i<retrade_and_auction_fields.length; i++) {
        item = Ext.getCmp(retrade_and_auction_fields[i]);
        item.setDisabled(!auc_and_retrade_visible);
        item.setVisible(auc_and_retrade_visible);
      }

      for (i=0; i<all_dates_fields.length; i++) {
        if ( date_fields[type] && date_fields[type].indexOf(all_dates_fields[i])>=0 )
        {
          visible = true;
        } else {
          visible = false;
        }
        item = Ext.getCmp(all_dates_fields[i]);
        item.setDisabled(!visible);
        item.setVisible(visible);
      }

      if ((p==Application.models.Procedure.type_ids.contest || p==Application.models.Procedure.type_ids.quotation
          ||p==Application.models.Procedure.type_ids.pricelist || p==Application.models.Procedure.type_ids.positional_purchase)
           // && Main.config.peretorg_possible_field
        ) {
        Ext.getCmp(peretorg_possible_id).setVisible(true);
        Ext.getCmp(peretorg_possible_id).setDisabled(false);
      } else {
        Ext.getCmp(peretorg_possible_id).setVisible(false);
        Ext.getCmp(peretorg_possible_id).setDisabled(true);
      }
      
      if(!Main.config.applic_opened_visible) {
        if(p==Application.models.Procedure.type_ids.contest || p==Application.models.Procedure.type_ids.quotation) {
          Ext.getCmp(date_applic_opened_id).setVisible(false);
          Ext.getCmp(date_applic_opened_id).setDisabled(false);
        }
      }

      var date_end_first_parts_review_text = 'Дата окончания срока рассмотрения заявок, предложений'+REQUIRED_FIELD;
      var date_begin_auction_text = 'Дата проведения (для аукционов)'+REQUIRED_FIELD;
      var time_begin_auction_text = 'Время проведения'+REQUIRED_FIELD;
      if (p == Application.models.Procedure.type_ids.auction_down) {
        date_end_first_parts_review_text = 'Дата окончания срока рассмотрения первых частей заявок'+REQUIRED_FIELD;
        date_begin_auction_text = 'Дата проведения редукциона'+REQUIRED_FIELD;
        time_begin_auction_text = 'Время проведения редукциона'+REQUIRED_FIELD;
      }
      function changeLabelText(field_id, label_text) {
        var field = Ext.getCmp(field_id);
        if (field.label) {
          field.label.update(label_text+':');
        } else {
          field.fieldLabel = label_text+':';
        }
      }
      changeLabelText(date_end_first_parts_review_id, date_end_first_parts_review_text);
      changeLabelText(date_begin_auction_id, date_begin_auction_text);
      changeLabelText(time_begin_auction_id, time_begin_auction_text);
      if(current_stage && current_stage>1) {
        changeLabelText(date_end_registration_id, "Дата и время окончания уточнения заявок, предложений");
      }

      var quotation = Ext.getCmp(quotation_form_id);
      if(p==Application.models.Procedure.type_ids.paper_pricelist) {
        quotation.setVisible(true);
      } else {
        quotation.setVisible(false);
      }
      if(Application.models.Procedure.groups.paper_forms.indexOf(p)>=0) {
        var is_electronic = false;
      } else {
        is_electronic = true;

        var offers_step_max = Ext.getCmp(offers_step_max_id);
        var offers_step_min = Ext.getCmp(offers_step_min_id);
        if (offers_step_max && offers_step_min) {
          if (p == Application.models.Procedure.type_ids.auction_up) {
            offers_step_min.maxValue = component.max_trade_step;
            offers_step_min.validate();
            offers_step_max.maxValue = component.max_trade_step;
            offers_step_max.validate();
          }
          if (p == Application.models.Procedure.type_ids.auction_down) {
            offers_step_min.maxValue = component.trade_step_exact?component.max_trade_step:10;
            offers_step_min.validate();
            offers_step_max.maxValue = component.trade_step_exact?component.max_trade_step:50;
            offers_step_max.validate();
          }
        }
      }
      
      if (!Ext.getCmp(send_oos_checkbox_id).disabled && is_electronic != component.is_electronic) {
        component.is_electronic = is_electronic;
        if (!component.startDefinition) {
          Ext.getCmp(purchase_method_id).setValue('');
        }
        var purchaseStore = Ext.getCmp(purchase_method_id).getStore();
        purchaseStore.setBaseParam('is_electronic', is_electronic);
        purchaseStore.reload();
      }
      component.startDefinition = false;

      if (Application.models.Procedure.groups.retrades.indexOf(p)>=0) {
        Ext.getCmp(private_fieldset_id).disable();
      } else {
        Ext.getCmp(private_fieldset_id).enable();
      }
      if (!component.holidays) {
        performRPCCall(RPC.Reference.holidays, [], {wait_disable: true}, function(resp) {
          component.holidays = resp.holidays;
          component.workdays = resp.workdays;
          setDisabledDates();
        });
      } else {
        setDisabledDates();
      }
      this.doLayout();
      /*component.typesStore.load();
      component.procedureDateSettings = component.typesStore.getById(p).data;*/
      component.procedure_type_id = p;
      var steps = Application.models.Procedure.getType(p+'').steps;
      component.steps = steps;
    };

    Ext.apply(this.listeners, {
      procedurechanged: this.procedureTypeChanged,
      addcustomer: function(customer_id) {
        var purchase = Ext.getCmp(purchase_method_id);
        var send_oos = Ext.getCmp(send_oos_checkbox_id);
        if (Main.contragent.id != customer_id) {
          purchase.customerDisabled = true;
          purchase.disable();
          purchase.hide();
        } else {
          purchase.customerDisabled = false;
          if (send_oos.getValue()) {
            purchase.enable();
            purchase.show();
          }
        }
      },
      scope: this
    });

    this.organizer_contragent_id = Main.contragent.id;
    Application.components.procedureBasicForm.superclass.initComponent.call(this);
    autoSetValue(this);
    this.fireEvent('procedurechanged', Main.config.basic_proc_type);
  }
});
