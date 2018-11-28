
Application.components.ProcedureChangeDatesForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    this.ids = {
      date_published_id : Ext.id()
    };

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
      data: Application.models.Procedure.prepareStepsData(Application.models.Procedure.getType('2').steps, null, 2)
    });

    component.typesStore = Application.models.Procedure.getTypesStoreFromRPC();
    component.typesStore.load();

    this.addEvents('procedurechanged');

    Ext.apply(this,
     {
      labelWidth: 300,
      frame: true,
      autoScroll: true,
      bodyCssClass: 'subpanel-top-padding',
      items : [{
          xtype: 'hidden',
          name: 'lot_id',
          value: component.lot_id
        }, {
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
            addstep: false,
            editstep: Main.config.multistep_edit_support,
            border: false,
            loadMask: true,
            parent: component,
            baseDate: new Date(),
            listeners: {
              added: function() {
                this.addEvents('procedurechanged');
                this.relayEvents(component, ['procedurechanged']);
              }
            }
          })
        ]}
      ],
      buttons: [{
        text: 'Перевести сроки',
        scope: this,
        formBind : true,
        handler: function() {
          var parameters = this.getValues();

          performRPCCall(RPC.Lot.changeLotDates, [parameters], {wait_text: 'Регистрируемся'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Сроки лота изменены', function() {redirect_to('po/procedure/index');});
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          redirect_to('po/procedure/index');
        }
      }],
      listeners: {
        beforerender : function() {
          Ext.getBody().mask('Загружаем данные');
          RPC.Lot.loadLotDates(component.lot_id, function(resp) {
            if (resp.success) {
              var visible, i, item, steps;

              component.setTitle('Перевод сроков проведения лота №'+resp.procedure.lot.number + ' процедуры '+resp.procedure.registry_number);

              component.procedure = resp.procedure;
              component.lot = resp.procedure.lot;
              component.procedure_type = resp.procedure.procedure_type;
              component.procedureDateSettings = component.typesStore.getById(component.procedure_type).data ;
              Ext.getCmp(component.ids.date_published_id).setValue(resp.procedure.date_published);
              component.fireEvent('procedurechanged', resp.procedure.procedure_type);
              var type = Application.models.Procedure.type_ids[component.procedure_type];
              if(component.lot.steps && component.lot.steps!="[]") {
                steps = Ext.util.JSON.decode(component.lot.steps);
              }
              if(!steps || !steps.length) {
                steps = Application.models.Procedure.getType(component.procedure_type).steps;
              }
              component.stepGridStore.loadData(Application.models.Procedure.prepareStepsData(steps, component.lot.status, component.procedure_type, component.procedure.with_preregistration, component.procedure.with_prequalification));
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
            Ext.getBody().unmask();
          });
        }
      },
      getValues: function() {
        var dt=null;
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

        /*if(component.procedure_type==Application.models.Procedure.type_ids.contest ||
           component.procedure_type==Application.models.Procedure.type_ids.quotation)  {
           dt=Ext.getCmp(date_end_registration_id).getValue();
           v.date_applic_opened = component.calculateDateOpened(dt);
        } */
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
      }
    });
    Application.components.ProcedureChangeDatesForm.superclass.initComponent.call(this);
  }
});
