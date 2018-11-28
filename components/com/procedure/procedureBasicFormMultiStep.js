
Ext.define('Application.components.procedureBasicFormMultiStep', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  parent: null,
  initComponent: function() {
    var component = this;

    component.ids = initIds (['date_published_id', 'properties_fieldset_id']);
    var procedure_type_id = Ext.id(),
      auction_step_id = Ext.id(),
      auction_app_stages_id = Ext.id(),
      auction_offers_delay_id = Ext.id(),
      applic_checkbox_id = Ext.id(),
      remoteId_id = Ext.id(),
      peretorg_possible_id = Ext.id(),
      commonfilepanel_id = Ext.id(),
      offers_step_min_id = Ext.id(),
      offers_step_max_id = Ext.id(),
      title_id = Ext.id(),
      private_access_id = Ext.id(),
      price_increase_id = Ext.id(),
      twostep_checkbox_id = Ext.id(),
      prequalification_checkbox_id = Ext.id(),
      total_steps_id = Ext.id(),
      private_fieldset_id = Ext.id(),
      step_reduction_id = Ext.id(),
      step_auction_id = Ext.id();

    var max_uploadsize = (Main.config.upload_max_size ? Main.config.upload_max_size : MAX_UPLOAD_SIZE);
    
    var only_auction_fields = [auction_step_id, auction_offers_delay_id, auction_app_stages_id];

    component.typesStore = Application.models.Procedure.getTypesStoreFromRPC();

    component.procedure_id = component.parent.procedure_id||null;

    component.start_price_of_lot = 0;

    component.date_published_fld = new Application.components.dateField({
      fieldLabel: 'Дата публикации процедуры'+REQUIRED_FIELD,
      xtype: 'Application.components.dateField',
      id: this.ids.date_published_id,
      format: 'd.m.Y',
      altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
      anchor: null,
      name: 'date_published',
      width: 200,
      value: now(),
      minValue: new Date()
    });

    component.stepGridStore = new Ext.data.JsonStore({
      autoDestroy: true,
      autoLoad: false,
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      fields: ['id','order_number','step_id','date_start', 'date_end', 'time_start','time_end'],
      data: Application.models.Procedure.prepareStepsData(Application.models.Procedure.getType('2').steps, undefined, 2)
    });

    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
    this.addEvents('peretorg');
    this.addEvents('peretorg_init');
    this.addEvents('onEditing');
    this.addEvents('startpricechanged');

    function PriceToNumber(str){
      /*
       * если прийдёт что-то типа '1 234,12',
       * то похоже на priceFormat и преобразуем в число
       * иначе вернём false
       */
      var filter = /^[\s\,0-9]+$/i;

      if (!filter.test(str))
        return false;  /*"Это не число!!!"*/
      v=str.replace(/\s/g,"");
      v=v.replace(',',".");
      v = parseFloat(v);
      if (v == "NaN")
        return false; /*"Это не число!!!"*/
      return v; /*"Это не число!!!"*/
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
              Ext.getCmp(component.ids.date_published_id).fireEvent('typeComboLoaded');
              component.fireEvent('procedurechanged', value.data.id);
            },
            beforerender : function (combo) {
              component.typesStore.load({callback: function() {
                combo.setValue(Main.config.basic_proc_type);
                component.procedureDateSettings = component.typesStore.getById(Main.config.basic_proc_type).data ;
                Ext.getCmp(component.ids.date_published_id).fireEvent('typeComboLoaded');
              }});
            }
          }
        }, {
          boxLabel: 'возможность проведения процедуры переторжки',
          xtype: 'checkbox',
          name: 'peretorg_possible',
          id: peretorg_possible_id,
          hidden: true,
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
          xtype: 'Application.components.combo',
          fieldLabel: 'Валюта процедуры',
          store: getCurrencyStore(),
          valueField: 'id',
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
        }]
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
          vtype: 'email',
          name: 'contact_email',
          fieldLabel: 'Адрес эл. почты'+REQUIRED_FIELD,
          value: Main.contragent.email
        }, {
          xtype: 'textfield',
          fieldLabel: 'Контактное лицо'+REQUIRED_FIELD,
          name: 'contact_person',
          value: Main.user.full_name
        }]
      }, {
        xtype: 'fieldset',
        title: 'Этапы проведения процедуры',
        labelWidth: 400,
        defaults: {
          labelWidth: 400
        },
        items: [
        component.date_published_fld,
        {
          fieldLabel: 'Максимальное количество этапов процедуры',
          name: 'total_steps',
          id: total_steps_id,
          xtype: 'Application.components.numberField',
          hidden: !Main.config.addstep_support
        }, {
          xtype: 'checkbox',
          hidden: !Main.config.preregistration_support && !Main.config.multistep_edit_support,
          fieldLabel: 'Двухэтапная процедура',
          id: twostep_checkbox_id,
          name: 'with_preregistration',
          listeners: {
            check: function(cb, checked) {
              var steps = component.steps||Application.models.Procedure.getType(''+component.procedure_type_id).steps;
              if(Application.models.Procedure.groups.support_multistep.indexOf(component.procedure_type_id)>=0 && checked) {
                component.with_preregistration = true;
              } else {
                component.with_preregistration = false;
              }
              var steps_array = Application.models.Procedure.prepareStepsData(steps, undefined, component.procedure_type_id, component.with_preregistration, component.with_prequalification);
              component.stepGridStore.loadData(steps_array);
              component.steps = steps_array;
            }
          }
        }, {
          xtype: 'checkbox',
          fieldLabel: 'С проведением квалификационного отбора',
          id: prequalification_checkbox_id,
          name: 'with_prequalification',
          hidden: !Main.config.prequalification_support && !Main.config.multistep_edit_support,
          listeners: {
            check: function(cb, checked) {
              var steps = component.steps||Application.models.Procedure.getType(''+component.procedure_type_id).steps;
              if(Application.models.Procedure.groups.support_multistep.indexOf(component.procedure_type_id)>=0 && checked) {                
                component.with_prequalification = true;
                //2013/10/28 ptanya 3657: #41608 Предварительная квалификация всегда с предварительной регистрацией
                if (Main.config.preregistration_inprequalification_support) {
                  component.with_preregistration = true;
                }
              } else {
                component.with_prequalification = false;
                //2013/10/28 ptanya 3657: #41608 Предварительная квалификация всегда с предварительной регистрацией
                if (Main.config.preregistration_inprequalification_support) {
                  component.with_preregistration = false;
                }
              }
              var steps_array = Application.models.Procedure.prepareStepsData(steps, undefined, component.procedure_type_id, component.with_preregistration, component.with_prequalification);
              component.stepGridStore.loadData(steps_array);
              component.steps = steps_array;
            }
          }
        }, {
            fieldLabel: 'Принимать предложения только на повышение',
            xtype: 'checkbox',
            name: 'price_increase',
            id: price_increase_id,
            hidden: true,
            disabled: true
          },
          new Application.components.procedureMultistepGrid({
          anchor: '100%',
          frame: false,
          editable: true,
          autoScroll: true,
          autoHeight: true,
          border: false,
          loadMask: true,
          parent: component,
          addstep: false,
          editstep: Main.config.multistep_edit_support,
          baseDate: (Ext.getCmp(component.ids.date_published_id)) ? Ext.getCmp(component.ids.date_published_id).getValue() : new Date(),
          listeners: {
            added: function() {
              this.addEvents('procedurechanged');
              this.relayEvents(component, ['procedurechanged']);

              this.addEvents('stageschanged');
              this.relayEvents(component, ['stageschanged']);
            }
          }
        })
      ]},
      {
        xtype: 'fieldset',
        title: 'Свойства процедуры',
        id: this.ids.properties_fieldset_id,
        labelWidth: 500,
        defaults: {
          labelWidth: 400
        },

        items: [{
          fieldLabel: 'Разрешить подачу заявок всем заявителям',
          xtype: 'checkbox',
          name: 'all_applics_allowed',
          id: applic_checkbox_id,
          hidden: true
        }, {
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
          fieldLabel: 'Шаг ценовых предложений, %' + REQUIRED_FIELD,
          xtype: 'compositefield',
          msgTarget: 'under',
          cls: 'cleanbackground',
          id: auction_step_id,
          defaults: {
            xtype: 'Application.components.percentField',
            allowNegative: false,
            allowDecimals: true,
            allowBlank: false,
            decimalPrecision: 4,
            minValue: 0.0001
          },
          items: [{
            xtype: 'displayfield',
            html: 'от '
          }, {
            fieldLabel: 'Минимальный шаг',
            value: (component.frm &&component.frm=='peretorg') ? 0:0.5,
            maxValue: (component.frm && component.frm=='peretorg') ?100:10,
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
            value: (component.frm &&component.frm=='peretorg') ?100:1,
            readOnly: (component.frm &&component.frm=='peretorg') ? true: false,
            name: 'offers_step_max',
            id: offers_step_max_id,
            width: 80,
            anchor: false,
            maxValue: (component.frm && component.frm=='peretorg') ?100:50
          }]
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'step_reduction',
          id: step_reduction_id,
          minValue: 0.01,
          maxValue: 999999999999,
          width: 100,
          anchor: false,
          allowBlank: false,
          fieldLabel: 'Шаг понижения (не более 10 процентов цены первоначального предложения)'+REQUIRED_FIELD,
          msgTarget: 'under',
          validator: function(v) {
            if (component.start_price_of_lot == 0){
              return "Задайте сначала цену первоначального предложения !!!";
            }
            var num = PriceToNumber(v);
            if (num === false)
              return "Это не число!!!";

            var m50 = num / 2;
            var p10 = component.start_price_of_lot / 10;
            if (num > p10) {
              return "Шаг понижения не может быть более 10% от "+ component.start_price_of_lot +" ( цены первоначального предложения )";
            }
            Ext.getCmp(step_auction_id).maxValue = m50;

            return true;
          }
        }, {
          xtype: 'Application.components.priceField',
          allowNegative: false,
          name: 'step_auction',
          id: step_auction_id,
          minValue: 0.01,
          maxValue: 999999999999,
          width: 100,
          anchor: false,
          allowBlank: false,
          msgTarget: 'under',
          fieldLabel: 'Шаг аукциона (сумма не более 50% “Шага понижения”)'+REQUIRED_FIELD,
          validator: function(v) {
            var num = PriceToNumber(v);
            if (num === false)
              return "Это не число!!!";
            var num2 = Ext.getCmp(step_reduction_id).getValue();

            if (num2 < 0.01)
              return "Задайте сначала Шаг понижения !!!";

            var m50 = Ext.getCmp(step_reduction_id).getValue() / 2;
            if (num > m50) {
              return "Шаг превышает 50% суммы “Шага понижения”";
            }
            return true;
          }
        }
      ]
      }, {
        xtype: 'fieldset',
        title: 'Документация процедуры',
        hidden: !Main.config.common_files,
        items: [
          {
            html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                  'Принимаются файлы размером до '+Ext.util.Format.humanizeSize(max_uploadsize)+'.',
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
        var dt=null, step;
        var v = {organizer_contragent_id: this.organizer_contragent_id};
        collectComponentValues(this, v, true);
        v.procedure_type = component.procedure_type_id;
        /* !!!! Чота похерилось из-за степов - не знаю как вписать в логику
         if(!Main.config.applic_opened_visible) {
         if(v.procedure_type==Application.models.Procedure.type_ids.contest ||
         v.procedure_type==Application.models.Procedure.type_ids.quotation)  {
         dt=Ext.getCmp(date_end_registration_id).getValue();
         v.date_applic_opened = component.calculateDateOpened(dt);
         }
         }*/
        if(v.steps.length) {
          for(var c=0; c<v.steps.length; c++) {
            step = v.steps[c];

            dt = Application.models.Procedure.getStep(step.step_id);
            // Ставим валуй в плоский массив, только если еще не было такого поля
            if(!v[dt.pseudo]) {
              v[dt.pseudo] = (!Ext.isEmpty(step.date_end)) ? step.date_end : step.date_start;
            }
          }
        }
        v.steps = Ext.util.JSON.encode(v.steps);

        if(v.procedure_type==Application.models.Procedure.type_ids.peretorg_reduc) {
          v.offers_wait_time = 60;
          v.offers_step_min = 0.0001;
          v.offers_step_max = 100;
        }
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
        this.procedure_data = v;
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
          Ext.getCmp(this.ids.date_published_id).setMinValue(date_now < saved_date ? date_now : saved_date);
        }
        var remoteId = Ext.getCmp(remoteId_id);
        if (v.remoteId||v.remote_id) {
          remoteId.show();
          remoteId.update(v.remoteId||v.remote_id);
          component.doLayout();
        } else {
          remoteId.hide();
        }

        if (v.procedure_type) {
          var type_data = Application.models.Procedure.getType(v.procedure_type);
          if(v.steps) {
            steps = Ext.util.JSON.decode(v.steps);
          }
          if(steps.length===0) {
            steps = type_data.steps;
            v.steps = Ext.util.JSON.encode(steps);
          }

          component.with_prequalification = v.with_prequalification;
          component.with_preregistration = v.with_preregistration;

          this.fireEvent('procedurechanged', Number(v.procedure_type), steps);

          if(v.with_preregistration) {
            Ext.getCmp(twostep_checkbox_id).fireEvent('check', true);
          }

          if(v.with_prequalification) {
            Ext.getCmp(prequalification_checkbox_id).fireEvent('check', true);
          }

        }
        if (v.application_stages && Application.models.Procedure.groups.auctions.indexOf(v.procedure_type)>=0 && v.frm!='peretorg') {
          this.fireEvent('stageschanged', Number(v.application_stages));
        }
        setComponentValues(this, v, true);

        if (v.stage>0) {
          if(v.frm=='peretorg') {
            Ext.getCmp(procedure_type_id).setValue(v.procedure_type);
            Ext.getCmp(title_id).setReadOnly(true);
            Ext.getCmp(title_id).addClass('x-readonly');
            this.fireEvent('peretorg_init');
          }
          this.fireEvent('peretorg', v.stage);
        }
        if(null!=v.date_published && v.version && v.version>=1) {
          Ext.getCmp(procedure_type_id).disable();
          //2013/10/28 ptanya 3657: #41608 Для простоты реализации не даем редактировать шаги
          Ext.getCmp(twostep_checkbox_id).disable();
          Ext.getCmp(prequalification_checkbox_id).disable();
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
      },
      changeLabelText: function(field_id, label_text) {
        var field = Ext.getCmp(field_id);
        if(!field) return;
        if (field.label) {
          field.label.update(label_text+':');
        } else {
          field.fieldLabel = label_text+':';
        }
      }
    });

    this.listeners = this.listeners||{};

    this.startPriceChanged = function(start_price) {
      component.start_price_of_lot = start_price;
      if (start_price > 0 )
        Ext.getCmp(step_reduction_id).maxValue=start_price;
    }

    this.procedureTypeChanged = function(p, steps) {
      var param_origin_steps = steps;
      var auc_visible = false;
      var auc_and_retrade_visible = false;
      var visible = false;
      var item, i, record;
      component.procedure_type_id = p;

      if(!steps || !steps.length) {
        var type = Application.models.Procedure.type_ids[''+p];
        steps = Application.models.Procedure.getType(p).steps;
        // в модели хранятся эталонные steps без какого либо указания дат и времени
        // но они все же где-то засоряются (см #23888)
        // место засора не нашел, поэтому приходится ставить костыль
        for(i=0; i<steps.length; i++) {
          steps[i].id = null;
          steps[i].date_start = null;
          steps[i].date_end = null;
          steps[i].time_start = null;
          steps[i].time_end = null;
          steps[i].included = null;
        }
      }
      
      if (!Main.config.multistep_edit_support && Application.models.Procedure.groups.support_multistep.indexOf(component.procedure_type_id)>=0) {
        if (Ext.getCmp(prequalification_checkbox_id).getValue()) {
          component.with_prequalification = true;
          if (Main.config.preregistration_inprequalification_support) {
            component.with_preregistration = true;
          }
        }
      } else {
        component.with_prequalification = false;
        if (Main.config.preregistration_inprequalification_support) {
          component.with_preregistration = false;
        }
      }
      component.stepGridStore.loadData(Application.models.Procedure.prepareStepsData(steps, undefined, p,
        component.with_preregistration, component.with_prequalification));
      component.steps = steps;

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
      var procedure_properties_disabled = 0;

      var procedure_properties_total = 3;

      for (i=0; i<only_auction_fields.length; i++) {
        item = Ext.getCmp(only_auction_fields[i]);
        item.setDisabled(!auc_visible);
        if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_only_two_stages != false
              && only_auction_fields[i] == auction_app_stages_id) {
          item.setVisible(false);
          if (Main.config.reduction_only_one_stages) item.setValue(1);
          if (Main.config.reduction_only_two_stages) item.setValue(2);
          procedure_properties_disabled+=1;
          item.fireEvent('select', item, item.getValue());
        } else if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_offers_delay != 0
              && only_auction_fields[i] == auction_offers_delay_id) {
          item.setVisible(false);
          procedure_properties_disabled+=1;
          item.setValue(Main.config.reduction_offers_delay);
        } else if (p == Application.models.Procedure.type_ids.auction_down
              && Main.config.reduction_offers_step_min != 0
              && Main.config.reduction_offers_step_max != 0
              && only_auction_fields[i] == auction_step_id) {
          item.setVisible(false);
          procedure_properties_disabled+=1;
          Ext.getCmp(offers_step_min_id).setValue(Main.config.reduction_offers_step_min);
          Ext.getCmp(offers_step_max_id).setValue(Main.config.reduction_offers_step_max);
        } else {
          item.setVisible(auc_visible);
          if(!auc_visible) {
            procedure_properties_disabled+=1;
          }
        }
      }

      if(this.procedure_type_id == PROCEDURE_TYPE_PUBLIC_SALE){
        procedure_properties_disabled = 1;
        Ext.getCmp(auction_offers_delay_id).hide();
        Ext.getCmp(auction_step_id).hide();
        Ext.getCmp(step_auction_id).show();
        Ext.getCmp(step_reduction_id).show();
      }else{
        Ext.getCmp(auction_offers_delay_id).show();
        Ext.getCmp(auction_step_id).show();
        Ext.getCmp(step_auction_id).hide();
        Ext.getCmp(step_reduction_id).hide();
      }
      var price_increase_checkbox = Ext.getCmp(price_increase_id);

      if((p==Application.models.Procedure.type_ids.contest || p==Application.models.Procedure.type_ids.quotation) && Main.config.support_price_increase_contest) {
        price_increase_checkbox.enable();
        price_increase_checkbox.show();
      } else {
        price_increase_checkbox.disable();
        price_increase_checkbox.hide();
      }

      if(procedure_properties_disabled==procedure_properties_total) {
        Ext.getCmp(component.ids.properties_fieldset_id).setVisible(false);
      } else {
        Ext.getCmp(component.ids.properties_fieldset_id).setVisible(true);
      }

      var peretorg_possible_field = Ext.getCmp(peretorg_possible_id);
      if ((p==Application.models.Procedure.type_ids.contest || p==Application.models.Procedure.type_ids.quotation || p==Application.models.Procedure.type_ids.pricelist)
            && Main.config.peretorg_possible_field) {

        peretorg_possible_field.setValue(true);
        peretorg_possible_field.setDisabled(false);
      } else {
        peretorg_possible_field.setValue(false);
        peretorg_possible_field.setDisabled(true);
      }

      var offers_step_max = Ext.getCmp(offers_step_max_id);
      var offers_step_min = Ext.getCmp(offers_step_min_id);
      if (offers_step_max && offers_step_min) {
        if (p == Application.models.Procedure.type_ids.auction_up) {
          offers_step_min.maxValue = Number.MAX_VALUE;
          offers_step_min.validate();
          offers_step_max.maxValue = Number.MAX_VALUE;
          offers_step_max.validate();
        }
        if (p == Application.models.Procedure.type_ids.auction_down) {
          offers_step_min.maxValue = 10;
          offers_step_min.validate();
          offers_step_max.maxValue = 50;
          offers_step_max.validate();
        }
      }
      if (Application.models.Procedure.groups.retrades.indexOf(p)>=0) {
        Ext.getCmp(private_fieldset_id).disable();
      } else {
        Ext.getCmp(private_fieldset_id).enable();
      }

      if (Application.models.Procedure.groups.auctions.indexOf(p)>=0 && p!=Application.models.Procedure.type_ids.peretorg_reduc) {
        if (param_origin_steps) {
          // если в событие переданы steps, то происходит первоначальное заполнение формы редактирования
          // поэтому не можем доверять тому что на форме и берем количество стадий из самой процедуры
          component.fireEvent('stageschanged', component.procedure_data.application_stages);
        } else {
          // если steps НЕ переданы, значит происходит смена типа процедуры в процессе редактирования
          // и здесь опираемся на то что указано в форме редактирования
          var stages_combo = Ext.getCmp(auction_app_stages_id);
          component.fireEvent('stageschanged', stages_combo.getValue());
        }
      }

      if(!Main.config.multistep_edit_support && Application.models.Procedure.groups.support_multistep.indexOf(component.procedure_type_id)>=0) {
        if (Main.config.preregistration_support || Main.config.multistep_edit_support) {
          Ext.getCmp(twostep_checkbox_id).show();
        }
        Ext.getCmp(prequalification_checkbox_id).show();
        if(Main.config.addstep_support) {
          Ext.getCmp(total_steps_id).enable();
          Ext.getCmp(total_steps_id).show();
        }
      } else {
        Ext.getCmp(twostep_checkbox_id).hide();
        Ext.getCmp(prequalification_checkbox_id).hide();
        Ext.getCmp(total_steps_id).disable();
        Ext.getCmp(total_steps_id).hide();
      }

      this.doLayout();
    };

    Ext.apply(this.listeners, {
      procedurechanged: this.procedureTypeChanged,
      startpricechanged: this.startPriceChanged,
      scope: this
    });

    this.organizer_contragent_id = Main.contragent.id;
    Application.components.procedureBasicFormMultiStep.superclass.initComponent.call(this);
    autoSetValue(this);
    this.fireEvent('procedurechanged', Main.config.basic_proc_type);
  }
  }
);
