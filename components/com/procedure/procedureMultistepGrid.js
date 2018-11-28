/**
 * @class Application.components.procedureMultistepGrid
 * @extends Ext.grid.Panel
 *
 * Грид этапов проведения процедуры
 *
 */
Ext.define('Application.components.procedureMultistepGrid', {
  extend: 'Ext.grid.Panel',
  editable: true,
  id: Ext.id(),
  addstep: true,
  editstep: true,
  name: 'steps',
  initComponent: function() {
    var component = this;

    component.steps = [];

    component.block_steps_till = null;

    this.holidays = null;
    this.workdays = null;

    this.step_store = Application.models.Procedure.getStepsStore(this.procedure_type_id);

    this.addEvents('stepSelected');
    this.enableBubble('load');

    var moveSelectedRow = function (grid, index, direction) {
      var record = grid.getStore().getAt(index);
      if (!record) {
        return;
      }
      //var index = grid.getStore().indexOf(record);
      if (direction < 0) {
        index--;
        if (index < 0) {
          return;
        }
      } else {
        index++;
        if (index >= grid.getStore().getCount()) {
          return;
        }
      }
      var grid_store = grid.getStore();
      grid_store.remove(record);
      grid_store.insert(index, record);
      grid.getSelectionModel().selectRow(index, true);
      grid_store.fireEvent('datachanged', grid_store);
    };

    var updateOrderNumbers = function() {
      var cnt = 1;
      component.getStore().data.each(function(rec) {
        rec.data.order_number = cnt;
        cnt++;
      });
    };

    var combo = new Ext.form.ComboBox({
      triggerAction: 'all',
      store: this.step_store,
      valueField: 'pseudo',
      editable: true,
      forceSelection: true,
      displayField: 'name',
      lazyRender: false,
      mode: 'local',
      listClass: 'x-combo-list-small'}
    );

    var dateRenderer = function(v) {
      if(null===v) return v;

      if(v==='') {
        return '<span class="readonly">ДД.ММ.ГГГГ</span>';
      }
      else {
        var dt = parseDate(v);
        return dt.format('d.m.Y');
      }
    };

    var timeRenderer = function(v) {
      if(null===v) return v;

      if(v==='') {
        return '<span class="readonly">ЧЧ:ММ</span>';
      }
      else {
        return v;
      }
    };

    var columns = [
      // Колонка не используется
      // {header: 'ИД', dataIndex: 'id',editor: Ext.ux.helpers.numberEdit(), sortable: false, hidden: true},
      {header: 'Наименование этапа', dataIndex: 'step_id', width: 140, sortable: false, editor: combo, xtype:'combocolumn', gridId: component.id},
      {header: 'Дата начала<br>этапа', dataIndex: 'date_start', width: 85, editor: Ext.ux.helpers.dateEdit(), renderer: dateRenderer, sortable: false},
      {header: 'Время начала', dataIndex: 'time_start', width: 70, editor: Ext.ux.helpers.timeEdit(),
        renderer: timeRenderer, sortable: false},
      {header: 'Дата окончания<br>этапа', dataIndex: 'date_end', width: 85, editor: Ext.ux.helpers.dateEdit(), renderer: dateRenderer, sortable: false},
      {header: 'Время<br>окончания', dataIndex: 'time_end', width: 70, editor: Ext.ux.helpers.timeEdit(),
        renderer: timeRenderer, sortable: false}
      // Колонка не используется
      // {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', sortable: false,
      //   hidden: !Main.config.multistep_edit_support, items: [
      //   {
      //     icon: '/ico/arrow_up.png',
      //     tooltip: 'Выше',
      //     isHidden: function(v, m, r) {
      //       updateOrderNumbers();
      //       if (component.block_steps_till && r.data.order_number<=(component.block_steps_till+1)) {
      //         return true;
      //       }
      //       if (r.data.order_number == 1) return true;
      //       return false;
      //     },
      //     handler: function(grid, rowIndex) {
      //       moveSelectedRow(grid, rowIndex, -1);
      //     }
      //   },
      //   {
      //     icon: '/ico/arrow_down.png',
      //     tooltip: 'Ниже',
      //     isHidden: function(v, m, r) {
      //       updateOrderNumbers();
      //       if (component.block_steps_till && r.data.order_number<=component.block_steps_till) {
      //         return true;
      //       }
      //       if (r.data.order_number == component.getStore().data.length) return true;
      //       return false;
      //     },
      //     handler: function(grid, rowIndex) {
      //       moveSelectedRow(grid, rowIndex, +1)
      //     }
      //   },
      //   {
      //     icon: '/ico/delete.png',
      //     isHidden: !component.editstep,
      //     tooltip: 'Удалить',
      //     isHidden: function(v, m, r) {
      //       updateOrderNumbers();
      //       if (component.block_steps_till && r.data.order_number<=component.block_steps_till) {
      //         return true;
      //       }
      //       return false;
      //     },
      //     handler: function(grid, rowIndex) {
      //       grid.getStore().removeAt(rowIndex);
      //     }
      //   }]
      // }
    ];
    this.store = component.parent.stepGridStore;
    this.store.addListener('load', function () {
      component.fireEvent('loadStore');
    });
    Ext.apply(this, {
      columns: columns,
      clicksToEdit: 1,
      viewConfig: {
        forceFit: true
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      tbar: [
        {
          iconCls: 'icon-silk-add',
          hidden: !component.editstep,
          text: 'Добавить стадию',
          handler: function(){
            var record = new component.parent.stepGridStore.recordType({
              id: null,
              date_end: '',
              time_end: '',
              date_start: null,
              time_start: null
            });
            component.parent.stepGridStore.add(record);
            component.startEditing(component.parent.stepGridStore.getCount()-1,1);
          }
        }, {
          xtype: 'tbspacer', width: 50, hidden: !Main.config.multistep_edit_support
        }, {
          iconCls: 'icon-silk-add',
          hidden: ! component.addstep,
          text: 'Добавить этап',
          handler: function(){
            var record_correction = new component.parent.stepGridStore.recordType({
              id: null,
              step_id: 'correction',
              date_start: null,
              date_end: '',
              time_start: null,
              time_end: ''
            });
            
            var record_envelopes = new component.parent.stepGridStore.recordType({
              id: null,
              step_id: 'applic_opened',
              date_start: null,
              date_end: '',
              time_start: null,
              time_end: ''
            });
            var record_selection = new component.parent.stepGridStore.recordType({
              id: null,
              step_id: 'first_parts',
              date_start: null,
              date_end: '',
              time_start: null,
              time_end: null
            });
            component.parent.stepGridStore.insert(component.parent.stepGridStore.getCount()-1,record_correction);
            if(Application.models.Procedure.hasStage('applic_opened', component.step_store, component.procedure_type_id)) {
                component.parent.stepGridStore.insert(component.parent.stepGridStore.getCount()-1,record_envelopes);
            }
            if(Application.models.Procedure.hasStage('first_parts', component.step_store, component.procedure_type_id)) {
                component.parent.stepGridStore.insert(component.parent.stepGridStore.getCount()-1, record_selection);
            }
            component.startEditing(component.parent.stepGridStore.getCount()-3,0);
          }
        }
      ],
      bbar: [ {
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        text: 'Отменить',
        handler: function(){
          component.parent.stepGridStore.rejectChanges();
        }
      }],
      listeners: {
        added: function() {
          this.step_store.load();
          if (!component.holidays) {
            performRPCCall(RPC.Reference.holidays, [], {wait_disable: true}, function(resp) {
              component.holidays = resp.holidays;
              component.workdays = resp.workdays;
            });
          }
        },
        procedurechanged: function(v) {
          if (component.editstep) {
            component.step_store.setBaseParam('procedure_type_id', v);
            component.step_store.reload({callback: function() {
              component.parent.stepGridStore.fireEvent('datachanged', component.parent.stepGridStore);
            }});
          }
        },
        stageschanged: function(stages) {
          if (component.parent.procedure_type_id
                && Application.models.Procedure.groups.auctions.indexOf(component.parent.procedure_type_id) < 0) {
            return;
          }
          var found_at = -1;
          component.parent.stepGridStore.each(function(r) {
            if (r.data.step_id == 'second_parts') {
              found_at = component.parent.stepGridStore.indexOfId(r.id);
            }
          });
          if (stages == 1) {
            if (found_at != -1) {
              component.parent.stepGridStore.removeAt(found_at);
            }
          } else if (found_at == -1) {
            var record_second_parts = new component.parent.stepGridStore.recordType({
              id: null,
              step_id: 'second_parts',
              date_start: null,
              date_end: '',
              time_start: null,
              time_end: null
            });
            component.parent.stepGridStore.add(record_second_parts);
          }
        },
        stepSelected: function(v) {
          var store = this.getStore();
          var step_record = store.getAt(store.find('step_id',v));
          if(step_record) {
            component.block_steps_till = step_record.data.order_number;
          }
        },
        beforeedit: function(e) {
          if(e.field=='step_id' && !component.editstep) {
            return false;
          }
          if(e.field!='date_start' && e.field!='date_end' && e.field!='time_end'  && e.field!='time_start') {
            return;
          }
          var grid = e.grid;
          var record = e.record;
          var fieldname = e.field;
          var fieldvalue = e.value;
          var rowIndex = e.row;
          var colIndex = e.column;
          var cancel = e.cancel;

          if(!record.data.step_id) {
            return;
          }

          if(fieldvalue==null || record.data.order_number<component.block_steps_till) {
            return false;
          }

          if(fieldname=='time_start' || fieldname=='time_end') return;

          var baseDate = new Date(), previous_record;
          if(0==rowIndex) {
            baseDate = component.baseDate;
          } else {
            previous_record = grid.getStore().getAt(rowIndex-1);
            baseDate = previous_record.data[fieldname];
            if(Ext.isEmpty(baseDate)) {
              if(fieldname=='date_start') {
                baseDate = previous_record.data.date_end;
              } else {
                baseDate = previous_record.data.date_start;
              }
            }
          }
          var field_data = Application.models.Procedure.getStep(record.data.step_id);
          var cellEditor = grid.getColumnModel().getCellEditor(colIndex, rowIndex);          
          if (!isAdmin()) { //2013/10/14 ptanya 3657: #41608 В КОМ админ может задавать любые даты
            this.setProcedureDateDisabling(cellEditor.field, baseDate, field_data.fld, component.parent.procedureDateSettings);
          }
          if(record.data.step_id=='trade') {
            this.setDisabledDates(cellEditor.field);
          }
          cellEditor.on('beforecomplete', function(editor, value, oldvalue) {
            if(Ext.isEmpty(value)) {
              editor.cancelEdit();
            }
          });
        },
        afteredit : function(e) {
          if(e.field!='step_id') return;

          if(!e.value||Ext.isEmpty(e.value)) return;

          var step_data = Application.models.Procedure.getStep(e.value);
          
          e.record.data.date_start=null;
          e.record.data.time_start=null;
          e.record.data.date_end=null;
          e.record.data.time_end=null;
          if (step_data.pseudo.indexOf('date_start')>=0) {
            e.record.data.date_start='';
            e.record.data.time_start='';
          } else if (step_data.pseudo != ''){
            e.record.data.date_end='';
            e.record.data.time_end='';
          }
          e.grid.view.refresh();
        }
      },
      getValues : function() {
        this.saveStepData();
        return component.steps;
      },
      saveStepData : function() {
        component.steps = [];
        component.step_names = [];
        var counter = 1;
        component.parent.stepGridStore.data.each(function(rec) {
          if(component.procedure_id) {
            rec.data.procedure_id = component.procedure_id;
          }
          if(rec.data.step_id=='trade' && component.step_names.indexOf('trade')>=0) {
            Ext.Msg.alert("Ошибка", "Этап Проведение процедуры (торги) не может повторяться дважды. Повторные торги подразумевает процедура переторжки в очной форме");
            return;
          }
          rec.data.order_number = counter;
          var date_obj, field_data = Application.models.Procedure.getStep(rec.data.step_id);
          if(!Ext.isEmpty(rec.data.date_start)) {
            date_obj = component.processDate(rec.data.date_start, rec.data.time_start, field_data);
            rec.data.date_start = date_obj.format('c');
          }
          if(!Ext.isEmpty(rec.data.date_end)) {
            date_obj = component.processDate(rec.data.date_end, rec.data.time_end, field_data);
            rec.data.date_end = date_obj.format('c');
          }


          component.step_names.push(rec.data.step_id);
          component.steps.push(rec.data);
          counter+=1;
        });
      },
      processDate : function(dt, tm, field_data) {
        var time = '', date_obj;
        date_obj = parseDate(dt);
        if(tm && !Ext.isEmpty(tm)) {
          time = tm.split(':');
          date_obj.setHours(time[0]);
          date_obj.setMinutes(time[1]);
          date_obj.setSeconds(0);
          date_obj.setMilliseconds(0);
        } else {
          date_obj.setHours(0);
          date_obj.setMinutes(0);
          date_obj.setSeconds(0);
          date_obj.setMilliseconds(0);
        }
        if(field_data.addTime && !tm) {
          if(field_data.addTime.hour) {
            date_obj = date_obj.add(Date.HOUR, field_data.addTime.hour);
          }

          if(field_data.addTime.minute) {
            date_obj = date_obj.add(Date.MINUTE, field_data.addTime.minute);
          }
        }
        return date_obj;
      }
    });

    Application.components.procedureMultistepGrid.superclass.initComponent.call(this);
  },
  setDisabledDates : function(cmp) {
    var component = this;
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

    return;
  },
  setProcedureDateDisabling: function (cmp, baseDate, fld, procedureDateSettings) {
    if (!Main.config.multistep_grid_date_all) {
      cmp.makeDateDisabling(baseDate, fld, procedureDateSettings);
    }
  }
});