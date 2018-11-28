/**
 * @class Application.components.lotEditForm
 * @extends Ext.tab.Panel
 *
 * Форма редактирования процедуры.
 *
 */
Ext.define('Application.components.lotEditForm', {
  extend: 'Application.components.procedureLotForm',
  // protected
  initComponent: function() {
    var component = this;

    this.formId = Ext.id();
    var button_load_from_template_id = Ext.id();
    //var lotnum = 1;
    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
    this.addEvents('peretorg');
    this.addEvents('peretorg_init');
    this.addEvents('idchanged');
    this.addEvents('blockStepsTillOrderNumber');

    if ( !Ext.isBoolean(this.editable) )
      this.editable = true;
    this.buttons = [{
        text: 'Сохранить',
        handler: function() {
          var redirect_to_edit = false;
          if (!component.procedure_id) {
            redirect_to_edit = true;
          }
          component.performSave(function() {
            if (redirect_to_edit) {
              redirect_to('com/lot/edit/id/'+component.lot_id+'/procedure/'+component.procedure_id);
            }
          });
        },
        scope: this
      }, {
        text: 'Подписать',
        handler: function() {
          var cnt = 0, warn = [], warn_fatal = false;

          var valid = this.validate();
          if (true!==valid && !valid.success) {
            warn_fatal = warn_fatal||valid.fatal;
            warn.push(valid.msg);
          }

          function doSave() {
            component.performSave(function(){
              if (component.procedure_id) {
                redirect_to('com/lot/sign/procedure_id/'+component.procedure_id+'/lot_id/'+component.lot_id);
              } else {
                Ext.Msg.alert('Ошибка', 'Почему-то отсутствует идентификатор процедуры. Попробуйте еще раз.');
              }
            });
          }
          if (warn.length) {
            warn = warn.join('<br/>\n');
            if (warn_fatal) {
              Ext.Msg.alert('Ошибка', warn);
              return;
            } else {
              Ext.Msg.confirm('Предупреждение', warn+'<br/>\nВы уверены что хотите внести изменения?', function(b){
                if ('yes'==b) {
                  doSave();
                }
              });
            }
          } else {
            doSave();
          }
        },
        scope: this
      }]; // buttons

    Application.components.lotEditForm.superclass.initComponent.call(this);
    var dates_panel = Ext.getCmp(this.ids.dates);
    if (dates_panel) {
      dates_panel.disable();
      dates_panel.hide();
    }
    var datePanel;

    if(Main.config.multistep_support) {
      datePanel = new Application.components.procedureBasicDatesMultiStep({
        title: 'Этапы проведения',
        frame: true,
        style: 'padding-left: 5px; padding-right: 5px;',
        id: this.formId
      });
    } else {
      datePanel = new Application.components.procedureBasicDates({
        title: 'Этапы проведения',
        frame: true,
        style: 'padding-left: 5px; padding-right: 5px;',
        id: this.formId
      });
    }
    datePanel.relayEvents(this, ['procedurechanged', 'blockStepsTillOrderNumber']);
    var tabpanel = this.findByType('tabpanel');

    tabpanel[0].insert(0, datePanel);
    //this.items.push(datePanel);

    this.listeners = this.listeners||{};

    Ext.apply(this.listeners, {
      idchanged: function(id) {
        component.lot_id = id;
      },
      numberchanged: function(newnumber) {
        component.lotNumber = newnumber;
      }
    }); // listeners apply

    if (this.value) {
      autoSetValue(this);
    }
    if (this.lot_id && this.procedure_id) {
      this.on('afterrender', function(){
        var params = {
          mask: true,
          mask_el: this.getEl(),
          scope: this
        };

        var p = {lot_id: this.lot_id, procedure_id: this.procedure_id};
        performRPCCall(RPC.Lot.loaddraft, [p], params,function(resp) {
          if (resp && resp.success) {
            this.setValues(resp.procedure);
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });
      }, this, {once: true});
    }
  },

  /**
   *
   * @param {Function} callback Callback
   */
  performSave: function(callback) {
    var component = this;
    performRPCCall(RPC.Lot.save, [this.getValues()], null, function(result) {
      if (result.success) {
        if (result.procedure) {
          component.setValues(result.procedure);
        }
        if ( Ext.isFunction(callback) ) {
          callback(result);
        }
      } else {
        echoResponseMessage(result);
      }
    }); // RPC.Procedure.save
  }, // performSave method

  /**
   * Получает данные компонента.
   * @return {Object} values
   */
  getValues: function() {
    var values = {}, dt, step;
    if (this.procedure_id) {
      values.procedure_id = this.procedure_id;
    }
    if (this.lot_id) {
      values.id = this.lot_id;
    }
    collectComponentValues(this, values,true);

    if(Main.config.multistep_support) {
      if(values.steps.length) {
        for(var c=0; c<values.steps.length; c++) {
          step = values.steps[c];

          dt = Application.models.Procedure.getStep(step.step_id);
          // Ставим валуй в плоский массив
          //if(!values[dt.pseudo]) {  // убираем проверку на наличие даты, пишем поверх датой из шага
            values[dt.pseudo] = (!Ext.isEmpty(step.date_end)) ? step.date_end : step.date_start;
          //}
        }
      }
      values.steps = Ext.util.JSON.encode(values.steps);
    } else {
      var custom_steps = Application.models.Procedure.mapDatesToSteps(values, this.steps, this.lot_data.status, this.procedure_type);
      values.steps = Ext.util.JSON.encode(custom_steps);
    }
    return values;
  }, // getValues method


  /**
   * Задаёт данные компонента.
   * @param {Object} v Объект данных.
   * @return {Application.components.procedureEditForm} this
   */
  setValues: function(v) {
    this.lot_data = v.lots[0];

    var cmp = this;
    if(v.procedure_type) {
      this.procedure_type_id = v.procedure_type;
      this.fireEvent('procedurechanged', v.procedure_type, this.lot_data.steps, this.lot_data.status);
    }

    setComponentValues(cmp, this.lot_data, true);
    if (v.lot_delivery_places) {
      Ext.getCmp(this.ids.delivery).setValues(this.lot_data.lot_delivery_places);
    }

    Ext.getCmp(this.ids.subject).setValues(this.lot_data);
    Ext.getCmp(this.ids.reqs).setValues(this.lot_data);

    var custom_steps = (v.steps) ? Ext.util.JSON.decode(v.steps) : Application.models.Procedure.getType(v.procedure_type+'').steps;
    cmp.steps = custom_steps;

    // запрет на редактирование прошедших шагов
    if (cmp.steps && cmp.steps.length>0 && v.lots && v.lots[0]) {
      for(var i=0; i<cmp.steps.length; i++) {
        if (cmp.steps[i].id == v.lots[0].current_step) {
          this.fireEvent('blockStepsTillOrderNumber', cmp.steps[i].order_number);
          break;
        }
      }
    }

    return this;
  } // setValues method



});
