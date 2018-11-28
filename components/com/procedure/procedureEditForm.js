/**
 * @class Application.components.procedureEditForm
 * @extends Ext.tab.Panel
 *
 * Форма редактирования процедуры.
 *
 */
Ext.define('Application.components.procedureEditForm', {
  extend: 'Ext.tab.Panel',

  /**
   * @cfg {Boolean} editable
   * false для отключения редактирования. По-умолчанию true.
   * Используется когда компонент нужен только для просмотра данных.
   *
   * В настоящее время эта опция не используется!
   */


  // protected
  initComponent: function() {
    var component = this;

    this.formId = Ext.id();
    var button_load_from_template_id = Ext.id();
    //var lotnum = 1;
    this.addEvents('procedurechanged');
    this.addEvents('stageschanged');
    this.addEvents('addcustomer');
    this.addEvents('oosstate');
    this.addEvents('peretorg');
    this.addEvents('peretorg_init');
    this.addEvents('idchanged');

    if ( !Ext.isBoolean(this.editable) )
      this.editable = true;

    this.items = [{
      title: 'Общие сведения',
      xtype: (Main.config.multistep_support) ? 'Application.components.procedureBasicFormMultiStep' : 'Application.components.procedureBasicForm',
      id: this.formId,
      parent: this,
      listeners: {
        beforerender: function(cmp) {
          cmp.frm = this.frm;
          component.relayEvents(cmp, ['procedurechanged', 'stageschanged', 'oosstate']);
          cmp.relayEvents(component, ['peretorg_init', 'peretorg', 'addcustomer','startpricechanged']);
        }
      }
    }];
    if (this.editable && !this.frm) {
      this.items.push({
        title: 'Добавить лот',
        lotAdd: true,
        iconCls: 'icon-silk-add'
      });
    }

    this.listeners = this.listeners||{};

    Ext.apply(this.listeners, {
      beforetabchange: function(tp, newtab) {
        if (newtab && newtab.lotAdd) {
          tp.addLot(true)
          return false;
        }
        return true;
      },
      removerequest: function(tp, cmp) {
        if (cmp.lotNumber) {
          tp.eachLot(function(l) {
            if (l.lotNumber>cmp.lotNumber) {
              l.setLotNumber(l.lotNumber-1);
            }
          });
          //lotnum--;
        }
        tp.remove(cmp);
        tp.doLayout();
      },
      idchanged: function(id) {
        component.procedure_id = id;
      },
      peretorg: function(frm, stage) {
        component.stage = stage;
      }
    }); // listeners apply

    if (this.editable) {
      this.buttons = [{
        text: 'Загрузить из шаблона',
        hidden: (this.frm) ? true : false,
        id: button_load_from_template_id,
        handler: function() {
          var win = new Application.components.templateGrid({
            mode: 'load',
            listeners: {
              templateloaded: function(template) {
                component.setValues(template);
                component.loadedProcedure = null;
                win.close();
              }
            }
          });
          win.show();
        }
      }, {
        text: 'Сохранить как шаблон',
        hidden: (this.frm) ? true : false,
        handler: function() {
          var win = new Application.components.templateGrid({
            mode: 'save',
            procedure_template: component.getValues()
          });
          win.show();
        }
      }, {
        text: 'Сохранить',
        handler: function() {
          var redirect_to_edit = false;
          if (!component.procedure_id) {
            redirect_to_edit = true;
          }
          component.performSave(function() {
            if (redirect_to_edit) {
              redirect_to('com/procedure/edit/id/'+component.procedure_id);
            }
          });
        },
        scope: this
      }, {
        text: 'Подписать и опубликовать',
        handler: function() {
          var cnt = 0, warn = [], warn_fatal = false;
          var procedure_params = {};
          collectComponentValues(Ext.getCmp(this.formId), procedure_params);
          if (procedure_params.offers_step_max && procedure_params.offers_step_min && procedure_params.offers_step_min>procedure_params.offers_step_max) {
            Ext.Msg.alert('Ошибка', 'Минимальный шаг ценовых предложений не может быть больше максимального.')
            return;
          }
          this.eachLot(function(l) {
            cnt++;
            var valid = l.validate(procedure_params);
            if (true !== valid && !valid.success) {
              warn_fatal = warn_fatal || valid.fatal;
              warn.push(valid.msg);
            }
          });
          if (0==cnt) {
            Ext.Msg.alert('Ошибка', 'У процедуры отсутствуют лоты. Необходимо добавить как минимум один лот.')
            return;
          }
          var doRedirect = function() {
            var redirect_to_edit = false;
            if (!component.procedure_id) {
              redirect_to_edit = true;
            }
            if (redirect_to_edit) {
              Main.procedure_edit_link_redirect = 'com/procedure/sign/procedure/'+component.procedure_id;
              redirect_to('com/procedure/edit/id/'+component.procedure_id);
            } else {
              if (component.procedure_id) {
                redirect_to('com/procedure/sign/procedure/'+component.procedure_id);
              } else {
                Ext.Msg.alert('Ошибка', 'Почему-то отсутствует идентификатор процедуры. Попробуйте еще раз.');
              }
            }
          };
          var data = component.getValues();
          if (data.send_to_oos && Ext.isEmpty(data.purchase_method_code)) {
            warn_fatal = true;
            warn.push('Ошибка: способ закупки обязателен для экспорта извещения о закупке на <a href="http://zakupki.gov.ru">zakupki.gov.ru</a>');
          }
          function doSave() {
            function save() {
              if (Main.config.disable_remote_edit && data.id && data.remote_id) {
                doRedirect();
              } else {
                component.performSave(doRedirect, true);
              }
            }
            if (Main.contragent.oos_send && !data.send_to_oos && (!this.frm ||this.frm!='peretorg')) {
              Ext.Msg.confirm('Предупреждение', 'Вы действительно не хотите отправить данные на Общероссийский официальный сайт www.zakupki.gov.ru?  Процедура в данном случае не будет опубликована на Общероссийском официальном сайте', function(b){
                if ('yes'==b) {
                  save();
                }
              });
            } else {
              save();
            }
          }
          if (this.loadedProcedure && this.loadedProcedure.organizer_user_id && Main && Main.user &&
              this.loadedProcedure.version && Main.user.id != this.loadedProcedure.organizer_user_id
             ) {
            warn.push('Предупреждение: вы пытаетесь внести изменение в процедуру, опубликованную другим пользователем');
          }
          if (warn.length) {
            warn = warn.join('<br/>\n');
            if (warn_fatal) {
              Ext.Msg.alert('Ошибка', warn);
              return;
            } else {
              Ext.Msg.confirm('Предупреждение', warn+'<br/>\nВы уверены что хотите опубликовать процедуру?', function(b){
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
    }

    Ext.apply(this, {
      activeTab: 0,
      enableTabScroll: true,
      defaults: {
        frame: true
      }

    });
    Application.components.procedureEditForm.superclass.initComponent.call(this);
    if (this.value) {
      autoSetValue(this);
    } else {
      this.on('beforerender', function() {
        this.addLot();
        if(this.frm && this.frm=='peretorg') {
          this.fireEvent('peretorg_init');
        }
      }, this, {once: true});
    }
    if (this.procedure_id) {
      this.on('afterrender', function(){
        var params = {
          mask: true,
          mask_el: this.getEl(),
          scope: this
        };

        var p = {procedure_id: this.procedure_id, stage: this.frm, lot_id: this.lot_id};
        performRPCCall(RPC.Procedure.loaddraft, [p], params,function(resp) {
          if (resp && resp.success) {
            if (resp.procedure.version && !(
                    resp.procedure.current_step_name == PSEUDO_STEP_EDIT ||
                    resp.procedure.current_step_name == PSEUDO_STEP_DEMAND_NEW ||
                    resp.procedure.current_step_name == PSEUDO_STEP_DEMAND_EDIT
            )) {
              var button_load_from_template = Ext.getCmp(button_load_from_template_id);
              button_load_from_template.setVisible(false);
            }
            this.procedure_organizer_department_id = resp.procedure.organizer_department_id;
            this.setValues(resp.procedure);
            this.stageParam = resp.procedure.stage;
            this.loadedProcedure = resp.procedure;
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });
      }, this, {once: true});
    }
  },

  /**
   * Вызывает callback для каждой вкладки компонента.
   * @param {Function} callback Callback
   */
  eachLot: function(callback) {
    if ( !Ext.isFunction(callback) )
      return false;
    this.items.each(function(item) {
      if (item.lotNumber) {
        if (false===callback(item)) {
          return false;
        }
      }
      return true;
    });
    return true;
  }, // eachLot method


  /**
   *
   * @param {Function} callback Callback
   */
  performSave: function(callback, cancel_load_values) {
    var component = this;
    var form_values = this.getValues();
    var call_params = null;
    if (Main.config.procedure_coordination) {
      if ((!form_values.old_coordination_status || form_values.old_coordination_status == COORDINATION_STATUS_DECLINED)
              && form_values.coordination_status == COORDINATION_STATUS_COORDINATION) {
        call_params = {confirm: 'Вы собираетесь направить данную закупку на согласование. Продолжить?'};

      } else if (form_values.old_coordination_status == COORDINATION_STATUS_COORDINATION
                  && form_values.coordination_status == COORDINATION_STATUS_RESOLVED) {
        call_params = {confirm: 'Вы согласовали данную закупочную процедуру. Продолжить?'};

      } else if (form_values.old_coordination_status == COORDINATION_STATUS_COORDINATION
                  && form_values.coordination_status == COORDINATION_STATUS_DECLINED) {
        call_params = {confirm: 'Отказ в согласовании закупочной процедуры. Вернуть процедуру исполнителю. Продолжить?'};
      }
    }
    performRPCCall(RPC.Procedure.save, [form_values], call_params, function(result) {
      if (result.success) {
        component.procedure_id = result.procedure.id;
        if (result.procedure && !cancel_load_values) {
          component.setValues(result.procedure);
        } else if (result.procedure_id) {
          this.fireEvent('idchanged', result.procedure_id);
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
   * Добавляет вкладку лота.
   * @param {Boolean} autoswitch true для переключения на создаваемую вкладку.
   * @param {Object} value Данные лота.
   * @return {Application.components.procedureEditForm} this
   */
  addLot: function(autoswitch, value, price_increase) {
    //var form = this.findByType('Application.components.procedureBasicForm');
    //if (!form || !form.id) return false;
    var newlot = new Application.components.procedureLotForm({
      parent: this,
      closable: (this.editable && !(this.frm && this.frm=='peretorg')),
      value: value
    });

    var lotnumbers = [];
    this.eachLot(function(l){
      lotnumbers.push(Number(l.getLotNumber()));
    });
    var lotnum = 1;
    while (lotnumbers.indexOf(lotnum)>=0) {
      lotnum++;
    }
    if (value) {
      if (this.frm=='peretorg') {
        if (price_increase) {
          RPC.Applic.getMaxPrice(value.basic_lot_id, function(resp){
            if (resp.success) {
              newlot.setPrice(resp.price);
            }
          });
        } else {
          RPC.Applic.getMinPrice(value.basic_lot_id, function(resp){
            if (resp.success) {
              newlot.setPrice(resp.price);
            }
          });
        }
      }
      newlot.setLotNumber(value.number);
      if(value.basic_lot_id) {
        newlot.basic_lot_id = value.basic_lot_id;
      } else {
        newlot.lot_id = value.id;
      }
    } else {
      newlot.setLotNumber(lotnum);
    }
    
    //lotnum++;
    newlot.relayEvents(this, ['procedurechanged', 'oosstate', 'stageschanged', 'peretorg', 'lotpricechanged']);

    var basicForm = Ext.getCmp(this.formId);
    var comboProcedureType = basicForm.getForm().findField('procedure_type').getValue();
    if (comboProcedureType) {
      newlot.fireEvent('procedurechanged', comboProcedureType);
    }
    newlot.relayEvents(basicForm, ['onEditing']);
    newlot.relayEvents(basicForm, ['addcustomer']);

    var insPos = this.items.getCount();
    if (this.editable && !this.frm) insPos--;
    this.insert(insPos, newlot);

    if (this.rendered) {
      this.doLayout();
    }
    if (autoswitch) {
      this.setActiveTab.defer(100, this, [insPos]);
    }

    return this;
  }, // addLot method


  /**
   * Получает данные компонента.
   * @return {Object} values
   */
  getValues: function() {
    /*var form = this.findByType('Application.components.procedureBasicForm');

    if (!form || !form[0].id) return false;

    var values = Ext.getCmp(form[0].id).getValues();*/
    var values = Ext.getCmp(this.formId).getValues();
    if (this.procedure_id) {
      values.id = this.procedure_id;
    }

    var dates = {
      date_published: values.date_published,
      date_end_registration: values.date_end_registration,
      date_end_first_parts_review: values.date_end_first_parts_review,
      date_end_second_parts_review: values.date_end_second_parts_review,
      date_applic_opened: values.date_applic_opened,
      date_begin_auction: values.date_begin_auction,
      time_begin_auction: values.time_begin_auction
    };
    var l;
    values.lots = [];
    this.eachLot(function(l){
      l = l.getValues();
      Ext.apply(l, dates);
      values.lots.push(l);
    });
    if (Ext.isEmpty(values.purchase_method_code) && values.lots.length && Ext.isDefined(values.lots[0].lot_customers)) {
      if (values.lots[0].lot_customers.length && !Ext.isEmpty(values.lots[0].lot_customers[0].purchase_method_code)) {
        values.purchase_method_code = values.lots[0].lot_customers[0].purchase_method_code;
      }
    }
    return values;
  }, // getValues method


  /**
   * Задаёт данные компонента.
   * @param {Object} v Объект данных.
   * @return {Application.components.procedureEditForm} this
   */
  setValues: function(v) {
    /*var form = this.findByType('Application.components.procedureBasicForm');
    if (!form || !form.id) return false;*/
    var to_del = [], to_hide=[];
    var i;
    this.procedure_id = v.id;
    this.stage = v.stage;
    var cmp = this;

    if (null!=v.date_published && v.version && v.version>=1) {
      this.editable = false;
      this.items.each(function(item) {
        if (item.lotAdd) {
          cmp.remove(item);
          return false;
        }
        return true;
      });
    }

    if (v.lots) {
      this.eachLot(function(l){
        if (!l.lot_id) {
          to_del.push(l);
        }
      });
      this.eachLot(function(l){
        if (!l.lot_id) {
          to_del.push(l);
        }
      });
      for (i=0; i<to_del.length; i++) {
        this.remove(to_del[i]);
        to_del[i].destroy();
      }

      for (i=0; i<v.lots.length; i++) {
        var found = false;
        if(v.lots[i].basic_lot_id == null) {
          v.lots[i].basic_lot_id = v.lots[i].id;
        }
        if (v.lots[i].id) {
          this.eachLot(function(l){
            if (l.lot_id == v.lots[i].id) {
              l.setValues(v.lots[i]);
              found = true;
            }
          });
        }
        if (!found) {
          this.addLot(false, v.lots[i], v.price_increase);
        }
      }
    }
    Ext.getCmp(this.formId).setValues(v);

    /* Костыль, костыль - не смогла схайдить для редактирования переторжки как следует, нид хелп */
    if (v.frm=='peretorg') {
      this.hideTabStripItem(1);
      this.hideTabStripItem(2);
    }
    this.fireEvent('peretorg', this.frm, this.stage);
    return this;
  } // setValues method



});
