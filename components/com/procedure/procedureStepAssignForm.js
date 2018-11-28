
Ext.define('Application.components.stepAssignForm', {
  extend: 'Ext.form.FieldSet',
  autoHeight: true,
  parent: null,
  initComponent: function() {
    var component = this;

    component.ids = this.parent.ids;

    var
      time_begin_auction_id = Ext.id(),
      step_infopanel_id = Ext.id(),
      step_jsoninfo_id = Ext.id(),
      step_panel_id = Ext.id();

    var all_dates_fields = [this.ids.date_end_registration_id, this.ids.date_applic_opened_id,
      this.ids.date_end_first_parts_review_id, this.ids.date_begin_auction_id, this.ids.time_begin_auction_id,
      this.ids.date_end_second_parts_review_id, this.ids.date_itog_id, this.ids.date_end_correction_id, this.ids.date_start_peretorg_reduc,
      this.ids.date_end_prequalification_id, this.ids.date_end_postqualification_id, this.ids.date_start_peretorg_contest];

    component.procedure_id = component.parent.parent.procedure_id||null;

    component.multistep = false;

    component.steps = [];

    component.dateFields = [];

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
      minValue: new Date(),
      listeners: {
        beforerender : function() {
          this.addEvents('typeComboLoaded', 'ParentDateSelected');
        },
        select: function() {
         this.fireEvent('ParentDateSelected', this.getValue());
        },
        valueFilled: function(v) {
          this.fireEvent('ParentDateSelected',v);
        },
        typeComboLoaded : function() {
          this.fireEvent('ParentDateSelected',this.getValue());
        }
      }
    });

    component.time_begin_auction_field = {
      xtype: 'timefield',
      fieldLabel: 'Время проведения'+REQUIRED_FIELD+':',
      labelSeparator: '',
      id: time_begin_auction_id,
      format: 'H:i',
      altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
      anchor: null,
      name: 'time_begin_auction',
      width: 200
    };

    this.holidays = null;
    this.workdays = null;


    this.addEvents('procedurechanged');
    this.addEvents('stepschanged');
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
      labelWidth: 300,
      title: 'Этапы проведения процедуры',
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
      items: [
        /*{
          xtype: 'panel',
          layout: 'hbox',
          id: step_panel_id,
          style: 'margin-bottom: 5px',
          layoutConfig: {
            align: 'top'
          },
          items: [
          {
            xtype: 'panel',
            html: 'Этапы проведения процедуры:',
            width: 404
          }, {
            xtype: 'panel',
            border: false,
            frame: false,
            layout: 'form',
            flex: 3,
            items:[
            {
              xtype: 'textarea',
              readOnly: true,
              id: step_infopanel_id,
              height: 80,
              hideLabel: true,
              anchor: '100%'
            },
            {
              xtype: 'button',
              text: 'Определение этапов проведения процедуры',
              parentCmp: component,
              listeners:  {
                added: function() {
                  this.addEvents('steps_added');
                  this.addEvents('procedurechanged');
                  this.relayEvents(component, ['procedurechanged']);
                },
                procedurechanged : function(v,steps) {
                  this.procedure_type_id = v;
                }
              },
              handler: function() {
                var infopanel = Ext.getCmp(step_infopanel_id);
                var jsonpanel = Ext.getCmp(step_jsoninfo_id);
                var btn = this;

                var step_data = (!Ext.isEmpty(jsonpanel.getValue())) ? Ext.util.JSON.decode(jsonpanel.getValue()):component.steps;

                var store = new Ext.data.JsonStore({
                  autoDestroy: true,
                  autoLoad: false,
                  data: step_data,
                  writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
                  idProperty: 'id',
                  autoSave: false,
                  paramsAsHash: true,
                  fields: ['id', 'order_number','step_id'],
                  listeners: {

                  }
                });

                var win = new Ext.Window({
                  closeAction: 'hide',
                  constrain: true,
                  modal: true,
                  width: Ext.getBody().getWidth()*0.5,
                  height: Ext.getBody().getHeight()*0.6,
                  hideAction: 'hide',
                  title: 'Определить этапность проведения процедуры',
                  layout: 'anchor',
                  items:[
                    new Application.components.procedureMultistepGrid({
                      anchor: '0 0',
                      frame: true,
                      editable: true,
                      autoScroll: true,
                      border: false,
                      loadMask: true,
                      btnCmp: this,
                      dataStore: store,
                      procedure_id: component.procedure_id,
                      procedure_type_id: btn.procedure_type_id
                    })
                  ],
                  listeners: {
                    steps_added : function(steps) {
                      if(!steps) return;
                      var item, i, step_list='';
                      var type = Application.models.Procedure.type_ids[''+component.procedure_type_id];
                      jsonpanel.setValue(Ext.util.JSON.encode(steps));

                      step_list+=component.createStepList(steps);

                      if(steps.length) {
                        infopanel.setValue(step_list);
                        component.multistep = true;
                      } else {
                        infopanel.setValue("Этапы не определены");
                        component.multistep = false;
                      }
                      component.fireEvent('stepsChanged', steps);
                      this.close();
                    },
                    added: function() {
                      this.addEvents('steps_added');
                    }
                  }
                });
                win.relayEvents(this, ['steps_added']);

                win.show();

              }
            }, {
              xtype: 'textarea',
              name: 'steps',
              id: step_jsoninfo_id,
              hidden: true,
              listeners: {
                valueFilled: function(v) {
                  if(v && !Ext.isEmpty(v)) {
                    var steps = Ext.util.JSON.decode(v), step_list = '';
                    step_list +=component.createStepList(steps);
                    Ext.getCmp(step_infopanel_id).setValue(step_list);
                    component.multistep = true;
                  }
                }
              }
            }]}
          ]
        },*/
        component.date_published_fld,
        new Ext.Panel({
          frame: false,
          border: false,
          name: 'steps',
          id: component.ids.properties_fieldset_id,
          layout: 'form',
          labelWidth: 400,
          items: [

          ]
        })
      ],
      listeners : {
         peretorg: function(frm,stage) {

        },
        peretorg_init : function() {

        }
      },
      getValues: function() {
        var dt=null;
        var v = {};
        collectComponentValues(this, v, true);
        v.procedure_type = component.parent.procedure_type_id;
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
             dt=Ext.getCmp(this.ids.date_end_registration_id).getValue();
             v.date_applic_opened = component.calculateDateOpened(dt);
          }
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
          Ext.getCmp(this.ids.date_published_id).setMinValue(date_now < saved_date ? date_now : saved_date);
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
        }

        setComponentValues(this, v, true);
      },
      setDisabledDates : function(cmp) {
        if(Application.models.Procedure.groups.auctions.indexOf(component.procedure_type_id)>=0) {
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
          cmp.setDisabledDates(disabled_dates);
        }
        return;
      },
      constructDateField : function(order_number, field_data, previous_field_event) {
        var fieldLabel = field_data.full_name.defaultName;
        //var proc_type_pseudo = Application.models.Procedure.type_ids[''+component.procedure_type_id];
        var proc_type_pseudo = component.procedure_type_id;
        if(field_data.full_name[proc_type_pseudo]) {
          fieldLabel = field_data.full_name[proc_type_pseudo];
        }
        var dateField = new Application.components.dateField({
          fieldLabel: fieldLabel+REQUIRED_FIELD,
          id: component.ids[field_data.pseudo+'_id_step_'+order_number],
          format: 'd.m.Y',
          altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i',
          anchor: null,
          name: field_data.pseudo,
          width: 200,
          listeners: {
            beforerender : function() {
              this.addEvents('ParentDateSelected', field_data['pseudo']+'_selected_step_'+order_number);
            },
            select: function() {
              var cur_value = this.getValue();
              var date = new Date(this.getValue()).add(Date.HOUR, field_data.addTime.hour);
              this.setValue(date.format(field_data.format));
            },
            change: notifier(field_data['pseudo']+'_selected_step_'+order_number),
            valueFilled: function(v) {
              this.fireEvent(field_data['pseudo']+'_selected_step_'+order_number, v);
            }
          }
        });

        dateField.on(previous_field_event, function(v) {
          if(!v || v=='') return;
          this.makeDateDisabling(v, field_data.fld, component.procedureDateSettings);
        });

        return dateField;
      },
      changeLabelText: function(field_id, label_text) {
        var field = Ext.getCmp(field_id);
        if(!field) return;
        if (field.label) {
          field.label.update(label_text+':');
        } else {
          field.fieldLabel = label_text+':';
        }
      },
      createStepList : function(steps) {
        var step_list = '', i, stIdx, st;
        if(!steps || !steps.length) return step_list;

        for(i=0; i<steps.length; i++) {
            st = Main.config.procedure_steps[steps[i]['step_id']].full_name;
            step_list += st;
            if(i<steps.length-1) step_list+='\n';
        }
        return step_list;
      }
    });

    this.listeners = this.listeners||{};

    this.stepsChanged = function(steps) {
      //steps = Ext.util.JSON.decode(steps);

      var component = this, st, i, dF, previous_datefield_data, field_data, previous_field_event,
          parentCmp = Ext.getCmp(component.ids.properties_fieldset_id), dateValues={}, fld_id;
      var ordered = [];
      var dateFields = [];

      collectComponentValues(parentCmp, dateValues, true);

      parentCmp.removeAll(true);
      parentCmp.doLayout();


      for(i=0; i<steps.length; i++) {
        st = steps[i];
        field_data = Application.models.Procedure.getStep(st.step_id);
        ordered[i] = {
          order_number: st.order_number,
          step_id: st.step_id,
          field_data: field_data
        };
        component.ids[field_data['pseudo']+'_id_step_'+st.order_number] = Ext.id();
        dateFields.push(component.ids[field_data['pseudo']+'_id_step_'+st.order_number]);
      }
      component.dateFields = dateFields;

      for(i=0; i<ordered.length; i++) {
        if(i>0) {
          previous_datefield_data = ordered[i-1]['field_data'];
          previous_field_event = previous_datefield_data['pseudo']+'_selected_step_'+(i+'');
        } else {
          previous_field_event = 'ParentDateSelected';
        }

        dF = component.constructDateField(ordered[i]['order_number'], ordered[i]['field_data'],previous_field_event);

        if(i>0) {
          dF.relayEvents(Ext.getCmp(component.ids[previous_datefield_data['pseudo']+'_id_step_'+(i+'')]), [previous_field_event]);
        } else {
          dF.relayEvents(component.date_published_fld, ['ParentDateSelected']);
        }
        parentCmp.add(dF);
        if(Application.models.Procedure.groups.auctions.indexOf(component.procedure_type_id)>=0
            && ordered[i]['field_data']['pseudo']=='date_begin_auction'
          ) {
          parentCmp.add(component.time_begin_auction_field);
          component.changeLabelText(time_begin_auction_id, component.time_begin_auction_text);
          component.setDisabledDates(dF);
        }
      }

      parentCmp.doLayout();

      setComponentValues(parentCmp, dateValues, true);

      component.steps = steps;
      var steps_json = Ext.util.JSON.encode(steps);
      Ext.getCmp(step_jsoninfo_id).setValue(steps_json);
      Ext.getCmp(step_jsoninfo_id).fireEvent('valueFilled', steps_json)
      component.multistep = true;
    };


    Ext.apply(this.listeners, {
      procedurechanged: function(v) {
        this.procedure_type_id = v;
      },
      scope: this
    });

    Ext.apply(this.listeners, {
      stepschanged: this.stepsChanged,
      scope: this
    });

    this.relayEvents(this.parent, ['stepschanged', 'procedurechanged']);

    Application.components.procedureStepAssignForm.superclass.initComponent.call(this);
  }
});
