
Ext.define('Application.components.procedureBasicDates', {
  extend: 'Ext.Panel',
  autoHeight: true,
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
      peretorg_possible_id = Ext.id(),
      commonfilepanel_id = Ext.id(),
      offers_step_min_id = Ext.id(),
      offers_step_max_id = Ext.id(),
      title_id = Ext.id(),
      private_access_id = Ext.id(),
      private_fieldset_id = Ext.id(),
      fieldset_documentation_id = Ext.id(),
      procedure_invitation_id = Ext.id();
    this.date_applic_opened_id = date_applic_opened_id;

    var only_auction_fields = [];
    var retrade_and_auction_fields = [date_begin_auction_id, time_begin_auction_id];
    //var only_tender_fields = [date_applic_opened_id, date_itog_id];
    var all_dates_fields = [date_end_registration_id, date_applic_opened_id, date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id, date_itog_id];
    var date_fields = {
      auction_up: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id],
      auction_down: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id,date_itog_id],
      auction: [date_end_registration_id,date_end_first_parts_review_id, date_begin_auction_id, time_begin_auction_id,date_itog_id],
      peretorg_reduc: [date_begin_auction_id, time_begin_auction_id],
      contest: [date_end_registration_id, date_applic_opened_id, date_end_first_parts_review_id, date_itog_id],
      peretorg_contest: [date_end_registration_id, date_end_first_parts_review_id, date_itog_id],
      quotation: [date_end_registration_id, date_applic_opened_id, date_itog_id],
      pricelist: [date_end_registration_id, date_itog_id],
      qualification: [date_end_registration_id, date_itog_id],
      paper_quotation: [date_end_registration_id, date_applic_opened_id, date_itog_id]
    };

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

    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
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

    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      items:[
      {
        title: 'Свойства процедуры',

        xtype: 'fieldset',
        labelWidth: 400,
        items: [
         {
          fieldLabel: 'Дата публикации процедуры'+REQUIRED_FIELD,
          xtype: 'Application.components.dateField',
          id: date_published_id,
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: 'date_published',
          width: 200,
          value: now(),
          minValue: new Date(),
          hidden: (this.hideDatePublished ? true : false),
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
          anchor: null,
          name: 'date_end_registration',
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('regDateSelected');
            },
            select: function() {
              var cur_value = this.getValue();
              var date = new Date(this.getValue()).add(Date.HOUR, 21);
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
              date = date.add(Date.MINUTE, 59);
              this.setValue(date);
            }
          }
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
          var cmp = Ext.getCmp(procedure_type_id);
          if(cmp) cmp.store = typesStore;
        }
      },
      getValues: function() {
        var dt=null;
        var v = {organizer_contragent_id: this.organizer_contragent_id};
        collectComponentValues(this, v, true);
        v.procedure_type = component.procedure_type_id;
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

        if([Application.models.Procedure.type_ids.contest,Application.models.Procedure.type_ids.quotation].indexOf(v.procedure_type )>-1){
          var labelEl = Ext.DomQuery.selectNode('label[for="'+this.date_applic_opened_id+'"]')
          if(labelEl){
            labelEl.innerHTML = 'Дата и время окончания срока публикации протокола открытия доступа к заявкам'+REQUIRED_FIELD;
          }
        }
        
        setComponentValues(this, v, true);
        if (v.procedure_type) {
          this.fireEvent('procedurechanged', Number(v.procedure_type));
        }
        if (v.application_stages) {
          this.fireEvent('stageschanged', Number(v.application_stages));
        }
        if(null!=v.date_published && v.version && v.version>=1) {
          var cmp = Ext.getCmp(procedure_type_id);
          if(cmp) cmp.disable()
          this.fireEvent('onEditing');
        }
      }
    });
    this.listeners = this.listeners||{};

    this.procedureTypeChanged = function(p, steps, status) {
      var auc_visible = false;
      var auc_and_retrade_visible = false;
      var visible = false;
      var item, i;
      var type = Application.models.Procedure.type_ids[''+p];
      var ptypes = Application.models.Procedure.type_ids;
      var pgroups = Application.models.Procedure.groups;

      if (pgroups.auctions.indexOf(p)>=0)
      {
        auc_visible = true;
        auc_and_retrade_visible = true;
      }
      if(pgroups.retrades.indexOf(p)>=0) {
        auc_visible = false;
      }

      for (i=0; i<only_auction_fields.length; i++) {
        item = Ext.getCmp(only_auction_fields[i]);
        item.setDisabled(!auc_visible);
        if ((p == ptypes.auction_down || p == ptypes.auction)
              && (Main.config.reduction_only_two_stages != false || Main.config.reduction_only_one_stages != false)
              && only_auction_fields[i] == auction_app_stages_id) {
          item.setVisible(false);
          if (Main.config.reduction_only_two_stages) {
            item.setValue(2);
          }
          item.fireEvent('select', item, item.getValue());
        } else if ((p == ptypes.auction_down || p == ptypes.auction)
              && Main.config.reduction_offers_delay != 0
              && only_auction_fields[i] == auction_offers_delay_id) {
          item.setVisible(false);
          item.setValue(Main.config.reduction_offers_delay);
        } else if (p == ptypes.peretorg_reduc
              && Main.config.peretorg_offers_delay != 0
              && only_auction_fields[i] == auction_offers_delay_id) {
          item.setVisible(false);
          item.setValue(Main.config.peretorg_offers_delay);
        } else if ((p == ptypes.auction_down || p == ptypes.auction)
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

      if(!Main.config.applic_opened_visible) {
        if(p==Application.models.Procedure.type_ids.contest || p==Application.models.Procedure.type_ids.quotation) {
          Ext.getCmp(date_applic_opened_id).setVisible(false);
          Ext.getCmp(date_applic_opened_id).setDisabled(false);
        }
      }

      var date_end_first_parts_review_text = 'Дата окончания срока рассмотрения заявок, предложений'+REQUIRED_FIELD;
      var date_begin_auction_text = 'Дата проведения (для аукционов)'+REQUIRED_FIELD;
      var time_begin_auction_text = 'Время проведения'+REQUIRED_FIELD;
      if (p == PROCEDURE_TYPE_AUC_DESC) {
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

      if(status) {
        component.procedure_status = status;
      }
      if(status==Application.models.Procedure.statuses.second_parts && Main.config.addstep_support) {
        changeLabelText(date_end_registration_id, "Дата окончания срока уточнения заявок, предложений"+REQUIRED_FIELD);
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
      component.typesStore.load(function() {
        component.procedureDateSettings = component.typesStore.getById(p).data;
      });

      component.procedure_type_id = p;
    };

    Ext.apply(this.listeners, {
      procedurechanged: this.procedureTypeChanged,
      blockStepsTillOrderNumber: this.onBlockStepsTillOrderNumber,
      scope: this
    });
    Application.components.procedureBasicDates.superclass.initComponent.call(this);
    autoSetValue(this);
    this.fireEvent('procedurechanged', 2);
  },
  onBlockStepsTillOrderNumber: function(num){
    //дизеблим даты
    this.getComponent(0).items.each(function(item,i){
      if(i<num){
        item.disable();
      }
    });
  }
});
