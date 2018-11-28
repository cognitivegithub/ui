
Ext.define('Application.components.procedureBasicDatesMultiStep', {
  extend: 'Ext.Panel',
  autoHeight: true,
  parent: null,
  initComponent: function() {
    var component = this;

    component.ids = initIds (['date_published_id', 'properties_fieldset_id']);
    var procedure_type_id = Ext.id();

    component.typesStore = Application.models.Procedure.getTypesStoreFromRPC();

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
      data: Application.models.Procedure.prepareStepsData(Application.models.Procedure.getType('2').steps, null, '2')
    });

    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
    this.addEvents('peretorg');
    this.addEvents('peretorg_init');
    this.addEvents('onEditing');
    this.addEvents('blockStepsTillOrderNumber');

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
      bodyCssClass: 'subpanel-top-padding',
      items: [ {
        xtype: 'fieldset',
        title: 'Этапы проведения процедуры',
        labelWidth: 400,
        defaults: {
          labelWidth: 400
        },
        items: [
        component.date_published_fld,
        new Application.components.procedureMultistepGrid({
          anchor: '100%',
          frame: false,
          editable: true,
          autoScroll: true,
          autoHeight: true,
          border: false,
          steps_editable: true,
          loadMask: true,
          parent: component,
          baseDate: (Ext.getCmp(component.ids.date_published_id)) ? Ext.getCmp(component.ids.date_published_id).getValue() : new Date(),
          listeners: {
            added: function() {
              this.addEvents('procedurechanged');
              this.relayEvents(component, ['procedurechanged', 'blockStepsTillOrderNumber']);

              this.addEvents('stageschanged');
              this.relayEvents(component, ['stageschanged']);
            }
          }
        })
      ]
      }],
      listeners : {
         peretorg: function(frm,stage) {
          
        },
        peretorg_init : function() {
          
        }
      },
      getValues: function() {
        var dt=null, step;
        var v = {};
        collectComponentValues(this, v, true);
        
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

        if (v.procedure_type) {
          var steps = [];
          var type_data = Application.models.Procedure.getType(v.procedure_type);
          if(v.steps) {
            steps = Ext.util.JSON.decode(v.steps);
          }
          if(steps.length===0) {
            steps = type_data.steps;
            v.steps = Ext.util.JSON.encode(steps);
          }

          this.fireEvent('procedurechanged', Number(v.procedure_type), steps);

        }

        setComponentValues(this, v, true);

        if(null!=v.date_published && v.version && v.version>=1) {
          Ext.getCmp(procedure_type_id).disable();
          this.fireEvent('onEditing');
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

    this.procedureTypeChanged = function(p, steps, status) {
      var auc_visible = false;
      var auc_and_retrade_visible = false;
      var visible = false;
      var item, i, record;
      component.procedure_type_id = p;
      component.typesStore.load(function(resp) {
        var component = this;
        component.procedureDateSettings = component.typesStore.getById(p).data;
      });
      if(!steps || !steps.length) {
        var type = Application.models.Procedure.type_ids[''+p];
        steps = Application.models.Procedure.getType(p).steps;
      }
      component.stepGridStore.loadData(Application.models.Procedure.prepareStepsData(steps, status, p));

      this.doLayout();
    };

    Ext.apply(this.listeners, {
      procedurechanged: this.procedureTypeChanged,
      scope: this
    });

    this.organizer_contragent_id = Main.contragent.id;
    Application.components.procedureBasicDatesMultiStep.superclass.initComponent.call(this);
    autoSetValue(this);
    this.fireEvent('procedurechanged', 2);
  }
});
