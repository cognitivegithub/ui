
Application.models.Procedure = {
  statuses: {
    added: 0,
    signed: 1,
    published: 2,
    applic_opened: 3,
    first_parts: 4,
    trade: 5,
    second_parts: 6,
    contract: 7,
    archive: 8,
    paused: 9,
    cancelled: 10,
    // и наоборот
    '0': 'Не подписан',
    '1': 'Не опубликован',
    '2': 'Прием заявок',
    '3': 'Вскрытие конвертов',
    '4': 'Рассмотрение заявок',
    '5': 'Торги',
    '6': 'Подведение итогов',
    '7': 'Заключение договора',
    '8': 'Архив',
    '9': 'Приостановлен',
    '10': 'Отменен'
  },
  step_dates :  {
  },
  type_ids: {
    auction_up: 1,
    auction_down: 2,
    contest: 3,
    quotation: 4,
    pricelist: 5,
    qualification: 6,
    peretorg_reduc: 7,
    peretorg_contest: 8,
    paper_single_supplier: 10,
    paper_auction_up: 11,
    paper_auction_down: 12,
    paper_contest: 13,
    paper_pricelist: 15,
    paper_quotation: 14,
    positional_purchase: 17,
    auction_up_26: 20,
    public_sale: 21,
//    competitive_selection: 32,
    // и наоборот
    '1': 'auction_up',
    '2': 'auction_down',
    '3': 'contest',
    '4': 'quotation',
    '5': 'pricelist',
    '6': 'qualification',
    '7': 'peretorg_reduc',
    '8': 'peretorg_contest',
    '10': 'paper_single_supplier',
    '11': 'paper_auction_up',
    '12': 'paper_auction_down',
    '13': 'paper_contest',
    '15': 'paper_pricelist',
    '14': 'paper_quotation',
    '17': 'positional_purchase',
    '20': 'auction_up_26',
    '21': 'public_sale'
  },
//2014/01/17 3722 ptanya groups будем хранить в БД
//2014/01/21 3722 ptanya Типы процедур грузим из БД в переменную types
  typesStore: null,
  statusStore : null,
  serverTypeStore: null,
  system_steps: ['contract', 'archive', 'pause', 'cancel'],
  coordination_status: ['','на согласовании','согласована','отклонена','отозвана'],

  getTypesStore: function() {
    if (!this.typesStore) {
      this.typesStore = new Ext.data.JsonStore({
        root: 'types',
        idProperty: 'id',
        data: this,
        fields: ['id', 'name', 'statuses', 'customStatusNames','hidden']
      });
    }
    return this.typesStore
  },
  getDocTypesStoreFromRPC: function() {
      var basesStore = getStore('doctypes', {
          directFn: RPC.Reference.listDocTypes,
          idProperty: 'id',
          root: 'rows',
          fields: ['id', 'name']
      });
      return basesStore;
  },
  getDocTypesStoreByProcedureTypeIdFromRPC: function(procedureTypeId) {
      var basesStore = getStore('doctypesByProcedureTypeId' + procedureTypeId, {
          directFn: RPC.Reference.listDocTypes,
        baseParams: {
          procedureTypeId: procedureTypeId
        },
          idProperty: 'id',
          root: 'rows',
          autoLoad: true,
          autoDestroy: false,
          fields: ['id', 'name', 'required']
      });
      return basesStore;
  },
  getDocTypesStoreByProcedureIdFromRPC: function(procedureId) {
      var basesStore = getStore('doctypesByProcedureId' + procedureId, {
          directFn: RPC.Reference.listDocTypes,
        baseParams: {
          procedureId: procedureId
        },
          idProperty: 'id',
          root: 'rows',
          autoLoad: true,
          fields: ['id', 'name', 'required']
      });
      return basesStore;
  },
  getTypesStoreFromRPC: function() {
    var serverTypeStore = getStore('procedure_types', {
      directFn: RPC.Reference.listProcedureTypes,
      idProperty: 'id',
      root: 'rows',
      autoLoad: false,
      sortInfo: { field: 'id', direction: 'ASC'}, 
      baseParams: {
        peretorg : false
      },
      fields: [
        'eis_code',
        'id','name','applic_publish_from','applic_publish_to','applic_opened_from','applic_opened_to','end_firstparts_from','end_firstparts_to','begin_auction_from','begin_auction_to','end_secondparts_from','end_secondparts_to','hidden'
      ],
      createSortFunction: function (field, direction) {
        direction = direction || "ASC";
        var directionModifier = direction.toUpperCase() == "DESC" ? -1 : 1;
        var sortType = this.fields.get(field).sortType;

        //POVEBA-326
        function getValueForCustomOrder(v){
          switch(v){
                  case PROCEDURE_TYPE_PAPER_TENDER:
                  case PROCEDURE_TYPE_TENDER:
                      v = 101;
                      break;
                  case PROCEDURE_TYPE_PAPER_AUC_DESC:
                  case PROCEDURE_TYPE_AUC_DESC:
                      v = 100;
                      break;
                  case PROCEDURE_TYPE_PRICELIST_REQ:
                  case PROCEDURE_TYPE_PAPER_PRICELIST_REQ:
                      v = 102;
                      break;
                  case PROCEDURE_TYPE_QUALIFICATION:
                  case PROCEDURE_TYPE_PREQUALIFY_SELECTION:
                  case PROCEDURE_TYPE_PAPER_PREQUALIFY_SELECTION:
                      v = 103;
                      break;
                  case PROCEDURE_TYPE_COMPETITIVE_SELECTION:
                  case PROCEDURE_TYPE_PAPER_COMPETITIVE_SELECTION:
                      v = 104;
                      break;
                  case PROCEDURE_TYPE_PAPER_SINGLE_SUPPLIER:
                      v = 105;
                      break;
                  case PROCEDURE_TYPE_PAPER_QUOTATION_REQ:
                  case PROCEDURE_TYPE_QUOTATION_REQ:
                      v = 106;    
                    break;
                }
          return v;
        }
        
        //create a comparison function. Takes 2 records, returns 1 if record 1 is greater,
        //-1 if record 2 is greater or 0 if they are equal
        return function (r1, r2) {

            var v1;
            var v2;

            if (field == 'id') {
                v1 = sortType(r1.data['id']);
                v2 = sortType(r2.data['id']);
                
                v1 = getValueForCustomOrder(v1);
                v2 = getValueForCustomOrder(v2);
            }
            else {
                v1 = sortType(r1.data[field]);
                v2 = sortType(r2.data[field]);
            }

            return directionModifier * (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
        };
      }

    });
    
    return serverTypeStore;
  },
  getPeretorgTypesStore: function() {
    var serverTypeStore = getStore('peretorg_types', {
      directFn: RPC.Reference.listProcedureTypes,
      idProperty: 'id',
      root: 'rows',
      autoLoad: true,
      baseParams: {
        peretorg : true
      },
      fields: [
        'id','name','applic_publish_from','applic_publish_to','applic_opened_from','applic_opened_to','end_firstparts_from','end_firstparts_to','begin_auction_from','begin_auction_to','end_secondparts_from','end_secondparts_to','hidden'
      ]
    });
    return serverTypeStore;
  },
  getStatusStore : function(typeId) {
    var curType = this.getType(typeId);
    var statuses = [];
    for(var i=0; i<curType.statuses.length; i++) {
      if(curType.statuses[i]>=2) {
        statuses.push([curType.statuses[i], this.statuses[curType.statuses[i]]]);
      }
    }

    this.statusStore = new Ext.data.ArrayStore({
        id: 0,
        autoload: false,
        fields: [
            'id',
            'name'
        ],
        data: statuses
    });
    return this.statusStore
  },
 
  getProcedureStore : function(baseParams, paramsCustom) {
    if (!baseParams) {
      baseParams = {};
    }
    if (!paramsCustom) {
      paramsCustom = {};
    }

    var params = {
      autoDestroy: true,
      directFn: RPC.Procedure.list,
      totalProperty: 'totalCount',
      root: 'procedures',
      remoteSort: true,
      autoLoad: false,
      idProperty: 'id',
      fields: ['id', 'remote_id','ucode','lots', 'registry_number', 'procedure_type', 'stage','frm',
        'subject', 'title', 'organizer_contragent_id', 'full_name', 'total_steps',
        {name: 'total_price', type: 'float', defaultValue: 0},
        {name: 'status', type: 'int'},
        'favourite', 'modified',
        'request_number', 'pending_doc_request_number', 'request_result_number', 'currency_name', 'currency_description',
        'application_stages', 'peretorg_possible', 'private', 'applics_count', 'organizer_department_id',
        'ps_current_step',
        {name: 'pending_applic_request_number', fields: [ {fields:['lot_id', 'applic_request']}]},
        {name: 'date_last_edited', type: 'date', dateFormat: 'c'},
        {name: 'date_last_update', type: 'date', dateFormat: 'c'},
        {name: 'date_published', type: 'date', dateFormat: 'c'},
        {name: 'date_fulfilled', type: 'date', dateFormat: 'c'},
        {name: 'date_placed', type: 'date', dateFormat: 'c'},
        {name: 'date_end_registration', type: 'date', dateFormat: 'c'},
        {name: 'date_begin_auction', type: 'date', dateFormat: 'c'},
        {name: 'date_end_auction', type: 'date', dateFormat: 'c'},
        {name: 'send_to_oos', type:'boolean'},
        'oos_publish_status', 'oos_changes_status', 'can_be_joint'],
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: baseParams
    };

    Ext.apply(params, paramsCustom);

    return new Ext.data.DirectStore(params);
},

  getType: function(id) {
    //for (var i=0; i<this.types.length; i++) {
    for(var i in this.types) {
      if (this.types[i].id == id) {
        //2014/01/21 3722 ptanya теперь информация о типе целиком грузится из БД
        //if (Main.config.procedure_paths.length > 0 && !this.types[i].load_steps) {
        //  this.types[i].steps = this.getStepsByType(id);
        //  this.types[i].load_steps = true;
        //}
        return this.types[i];
      }
    }
    return null;
  },
  //2013/11/20 3719 ptanya Информация о шагах берется из БД
  getStep: function(pseudo) {
    var d = this.step_dates[pseudo];
    if (!d || !d.load){
      d = [];
      step = Main.config.procedure_steps[pseudo];
      if (step) {
        d.pseudo = step.date_field_name;
        d.fld = step.date_limits_field_name;
        d.full_name = { defaultName: step.date_full_name };
        if (step.custom) {
          for (var type_id in step.custom) {
            if (step.custom[type_id]['date_full_name']) {
              d.full_name[type_id] = step.custom[type_id]['date_full_name'];
            }
          }
        }
        d.status_name = { defaultName: step.full_name };
        d.addTime = {
          hour: step.date_def_add_hour,
          minute: step.date_def_add_minute
        };
        d.links = { defaults: step.links },
        d.format = 'd.m.Y H:i';
        if (step.date_only_renderer) {
          d.displayFormat = 'd.m.Y';
        }
      }
      d.load = true;
      this.step_dates[pseudo] = d;
    }
    return d;
  },
  isStatusExists: function(type_id, status_id) {
    var curType = this.getType(type_id);
    if (!curType) {
      return false;
    }
    return (curType.statuses.indexOf(status_id)>=0);
  },
  init: function(config) {
    if (config.quotation_req_enable_first_parts) {
      var quotation = this.getType(this.type_ids.quotation);
      quotation.statuses.push(this.statuses.first_parts);
      quotation.statuses = quotation.statuses.unique().sort();
    }

    if (config.paper_form) {
      for (var i=0; i<this.types.length; i++) {
        if (this.groups.paper_forms.indexOf(this.types[i].id) > -1) {
          this.types[i].hidden = false;
        }
      }
    }
    //2014/01/21 3722 ptanya Типы процедур грузим из БД
    this.types = config.procedure_types;
    this.groups = config.procedure_groups;
  },          
  getStepsStore : function(procedure_type_id) {
    return getStore('step_store_'+procedure_type_id, {
      storeId: 'step_store',
      directFn: RPC.Reference.list,
      paramsAsHash: true,
      autoDestroy: false,
      autoLoad: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'pseudo', 'name'
      ],
      sortInfo: {
        field: 'full_name',
        direction: 'ASC'
      },
      baseParams: {
        reftype: 'ProcedureSteps',
        idfield: 'pseudo',
        namefield: 'full_name',
        procedure_type_id: procedure_type_id
      },
      remoteSort: true
    });
  },
  createLotStepsStore : function(steps, proctype) {
    var steps_data = [], statusName, lot_steps_store;

    for(var i=0; i<steps.length; i++) {
      statusName = Application.models.Procedure.getStep(steps[i].step_id).status_name.defaultName;
      if(Application.models.Procedure.getStep(steps[i].step_id).status_name[proctype]) {
        statusName = Application.models.Procedure.getStep(steps[i].step_id).status_name[proctype];
      }
      steps_data.push([steps[i].step_id, statusName]);
    }
    steps_data.push(['contract', 'Заключение договора']);
    steps_data.push(['archive', 'Архив']);
    steps_data.push(['pause', 'Приостановка процедуры']);
    steps_data.push(['cancel', 'Отмена процедуры']);

    lot_steps_store = new Ext.data.ArrayStore({
      autoLoad: false,
      fields: [
        'step_id',
        'name'
      ],
      data: steps_data
    });
    return lot_steps_store
  },
  hasStage : function(step_id, steps_store, procedure_type_id) {
     var steps = [], idx, i;
     
     if(!steps_store) {
         if(!procedure_type_id) 
             return false;
         steps = Application.models.Procedure.getType(procedure_type_id).steps;
         for(i=0; i<steps.length; i++) {
             if(steps[i].step_id==step_id) {
                 return true;
             }
         }
     } else {
        idx = steps_store.find('pseudo', step_id);
        if(idx>=0) return true;
     }
     return false;
  },
  //2013/11/20 3719 ptanya Маршруты
//2014/01/21 3722 ptanya теперь информация о типе целиком грузится из БД, и аналогичная функция есть в php
//  getStepsByType : function(ptype_id) {
//    var step_array = [];
//    if (Main.config.procedure_paths.length > 0) {
//      for(i=0; i<Main.config.procedure_paths.length; i++) {
//        step = Main.config.procedure_paths[i];
//        if (typeof step.allowed_procedure_types === 'string' && step.allowed_procedure_types != "") {
//          if (!(new RegExp("," + ptype_id + ",").test("," + step.allowed_procedure_types + ","))) {
//            continue; //этого шага нет у процедуры
//          }
//        }
//        step_array.push({order_number: step.order_number, step_id: step.step_pseudo, statusId: step.status});
//      }
//    }
//    return step_array;
//  },
  prepareStepsData : function(steps, status, procedure_type_id, with_preregistration, with_prequalification, override_edit_support) {
    var i, j, step, step_data, time_obj, for_start = false, withTime = false, current_dates;
    var step_array = [];
    if(Ext.isString(steps)) {
      steps = Ext.util.JSON.decode(steps);
    }

    if(!Main.config.multistep_edit_support && !override_edit_support) {
      var type_steps = Application.models.Procedure.getType(procedure_type_id).steps;
      for(i=0; i<type_steps.length; i++) {

        if(type_steps[i].step_id=='registration' && with_prequalification) {
          type_steps[i].step_id = 'qual_registration';
        }
        
        if(type_steps[i].step_id=='qual_registration' && !with_prequalification) {
          type_steps[i].step_id = 'registration';
        }
        
        if(type_steps[i].step_id=='procedure_correction' && !with_preregistration) {
          continue;
        }
        if(type_steps[i].step_id=='correction' && type_steps[i-1].step_id=='procedure_correction' && !with_preregistration) {
          continue;
        }
        if(type_steps[i].step_id=='prequalification' && !with_prequalification) {
          continue;
        }
        if(type_steps[i].step_id=='correction' && type_steps[i-1].step_id=='prequalification' && !with_prequalification) {
          continue;
        }

        for(j=0; j<steps.length; j++) {
          if(steps[j].step_id==type_steps[i].step_id && (!steps[j].included)) {
            type_steps[i]=steps[j];
            steps[j].included = true;
            break;
          }
        }
      }
    } else {
      var type_steps = steps;
    }

    if (type_steps == undefined) {
      return [];
    }

    for(i=0; i<type_steps.length; i++) {
      step = type_steps[i];
      step_data = this.getStep(step.step_id);     

      if(!Main.config.multistep_edit_support) {
        if(step.step_id=='procedure_correction' && !with_preregistration) {
          continue;
        }
        if(step.step_id=='correction' && type_steps[i-1].step_id=='procedure_correction' && !with_preregistration) {
          continue;
        }
        if(step.step_id=='prequalification' && !with_prequalification) {
          continue;
        }
        if(step.step_id=='correction' && type_steps[i-1].step_id=='prequalification' && !with_prequalification) {
          continue;
        }
      }

      if (step_data.pseudo) {
        if(step_data.pseudo.indexOf('date_start')>=0 || step_data.pseudo.indexOf('date_begin')>=0) {
          for_start = true;
        } else {
          for_start = false;
        }

        if(!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i') {
          withTime = true;
        } else {
          withTime = false;
        }
        step.time_end = (for_start)? null : ((withTime)?'':null);
        step.time_start = (for_start)? ((withTime)?'':null): null;

        if((step.date_end && step.date_end!=='') || (step.date_start  && step.date_start!=='')) {
          if(step.date_end && !Ext.isEmpty(step.date_end)) {
            step.date_end = parseDate(step.date_end);
            if((!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i')) {
              step.time_end = step.date_end.format('H:i');
            }
          }

          if(step.date_start && !Ext.isEmpty(step.date_start)) {
            step.date_start = parseDate(step.date_start);
            if((!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i')) {
              step.time_start = step.date_start.format('H:i');
            }
          }
        }
        if(Ext.isEmpty(step.date_end)) {
          step.date_end = (for_start) ? null : '';
        }
        if(Ext.isEmpty(step.date_start)) {
          step.date_start=(for_start) ? '': null;
        }
      } else {
        step.date_start=null;
        step.time_start=null;
        step.date_end=null;
        step.time_end=null;
      }

      step_array.push(step);
    }
    return step_array;
  },
  mapDatesToSteps : function(values, steps, status, procedure_type_id) {
    var i, step_data, for_start, withTime, step, steps_array=[], isSecondPartsHere=false, step_date=false;

    for(i=0; i<steps.length; i++) {
      step_data = Application.models.Procedure.getStep(steps[i].step_id);
      step = steps[i];
      if(step_data.pseudo.indexOf('date_start')>=0 || step_data.pseudo.indexOf('date_begin')>=0) {
        for_start = true;
      } else {
        for_start = false;
      }

      if(!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i') {
        withTime = true;
      } else {
        withTime = false;
      }
      if(step_data.step_id=='second_parts') {
        isSecondPartsHere = true;
      }

      if(step_data.step_id=='correction') {
        step_date = parseDate(values['date_end_registration']);
      } else {
        if(values[step_data['pseudo']]) {
          step_date = parseDate(values[step_data['pseudo']]);
        }
      }

      step.time_end = null;
      step.time_start = null;
      step.date_end = null;
      step.date_start = null;

      if(step_date) {
        if(!for_start) {
          step.date_end = step_date;
          if((!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i')) {
            step.time_end = step.date_end.format('H:i');
          }
        } else {
          step.date_start = step_date;
          if((!step_data.displayFormat || step_data.displayFormat=='d.m.Y H:i')) {
            step.time_start = step.date_start.format('H:i');
          }
        }
      }

      steps_array.push(step);

      if(!isSecondPartsHere && Application.models.Procedure.groups.auctions.indexOf(procedure_type_id)>=0 && values.application_stages>1) {
        var date_end=null;
        if(values.date_end_second_parts_review) {
         date_end = parseDate(values.date_end_second_parts_review)
        }
        steps_array.push({
          step_id: 'second_parts',
          date_end: date_end,
          time_end: null,
          date_start: null,
          time_start: null,
          order_number: null,
          id: null,
          statusId:6
        });
      }
    }
    return steps_array;
  },
  multiValueRenderer: function (renderer, column, meta, record) {
      //fix ie8 error
      if (!record.data.lots || record.data.lots.length==0)
        return '';

      var values = [];
      for (var i = 0; i < record.data.lots.length; i++) {
          var renderer_result = renderer(record.data.lots[i][column], meta, record, i, column);
          if (null != renderer_result && typeof renderer_result == 'object' && renderer_result.length > 0) {
              for (var j = 0; j < renderer_result.length; j++) {
                  values.push(renderer_result[j]);
              }
          } else {
              values.push(renderer_result);
          }
      }
      return values.unique().join(', ');
  },
  statusRenderer: function (v, m, r, l) {
      v = v || 1;
      var st = '', stat = '', step_data;
      var t = Application.models.Procedure.getType(r.data.procedure_type);
      if (t && t.customStatusNames && t.customStatusNames[v]) {
          st = t.customStatusNames[v];
      } else {
          st = v ? Application.models.Procedure.statuses[v] : '';
      }
      if (r.data.actual == false) {
        return 'Удалена';
      }
      var lot_step = false;
      //2013/10/18 ptanya 3657: #41608 у неопубликованных могут быть разные этапы с разными названиями, например "Редактирование извещения"
      //if (v>1 && undefined !== l && r && r.data && r.data.lots && r.data.lots[l] && r.data.lots[l].lot_step) {
      if (v >= 1 && undefined !== l && r && r.data && r.data.lots && r.data.lots[l] 
              && (r.data.lots[l].current_step || r.data.lots[l].lot_step)) {
          lot_step = r.data.lots[l].lot_step;

        if (v != Application.models.Procedure.statuses.archive
              && v != Application.models.Procedure.statuses.archive
              && v != Application.models.Procedure.statuses.cancelled){
          if (!lot_step) {
            //2014/04/01 ptanya 4039 Если данные из getFormData, то нужно узнать название текущего шага
            var steps = r.data.lots[l].steps;
            for(var i=0; i<steps.length; i++) {
              if (steps[i].id == r.data.lots[l].current_step) {
                lot_step = steps[i].step_id;
                break;
              }
            }
          }
          if (lot_step) {
            step_data = Application.models.Procedure.getStep(lot_step);
            if (step_data.status_name[Application.models.Procedure.types[r.data.procedure_type]]) {
                st = step_data.status_name[Application.models.Procedure.types[r.data.procedure_type]]
            } else {
                st = step_data.status_name.defaultName;
            }

          }
        }
      }
      if (r && r.data && r.data.procedure_type == PROCEDURE_TYPE_PAPER_SINGLE_SUPPLIER) {
        switch (lot_step) {
          case (PSEUDO_STEP_APPLICATION_REGISTRATION):
            st = 'Регистрация ПД и СО в ЮО';
            break;
          case (PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_UO):
            st = 'Согласование ПД и СО в ЮО';
            break;
          case (PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_DEPARTMENTS):
          case(PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_DEPARTMENTS_SIMPLE):
            st = 'Согласование ПД и СО в согласующих подразделениях';
            break;
          case (PSEUDO_STEP_APPLICATION_WAIT_AGREEMENT_GDFR):
            st = 'Утверждение ПД и СО у ГД/ФР';
            break;
          case (PSEUDO_STEP_CONTRACT_CONCLUSION):
            st = 'Заключение договора с ЕП';
            break;
        }
      } else if (r && r.data && r.data.procedure_type == PROCEDURE_TYPE_TENDER) {
        switch (lot_step) {
          case (PSEUDO_STEP_EVALUATION_COMPARISON_DEMANDS):
            if (r.data.has_one_applic) {
              st = 'Оценка заявки единственного участника';
            }
            break;
        }
      }

      if (v == Application.models.Procedure.statuses.trade
          && undefined !== l && r && r.data && r.data.lots && r.data.lots[l] && r.data.lots[l].date_end_auction) {
          st += ' (завершены)';
      }
      if (Main.config.disable_custom_status) {
        return st;
      }

      if (v == Application.models.Procedure.statuses.signed && r.data.send_to_oos && !Main.config.veb_rename_statuses) {
          switch (r.data.oos_publish_status) {
              case -1:
                  st = 'Отказано в публикации в ЕИС';
                  break;
              case 1:
                  st = 'Ожидает публикации в ЕИС';
                  break;
          }
      }



      if ((v == Application.models.Procedure.statuses.published || v == Application.models.Procedure.statuses.applic_opened || v == Application.models.Procedure.statuses.first_parts) && r.data.send_to_oos) {
          switch (r.data.oos_changes_status) {
              case -1:
                  st += '. Отказано в публикации изменений в ЕИС';
                  break;
              case 1:
                  st += '. Ожидается публикация изменений в ЕИС';
                  break;
          }
      }

      return st;
  },
          
  getCurrentStepPseudo : function(r) {
    var step;
    if (!r.data) {
      r.data = r;
    }
    if (r.data.lots.length > 0){
      step = Application.models.Lot.getCurrentStepPseudo(r.data.lots[0]);
    }
    if(!step) { //Перенесено из isButtonVisible(...)
      var status = calculateStatusNumber('status', r);
      // если нет лотов или у них у всех статус 0
      if (status === 0) {
        return PSEUDO_STEP_DEMAND_NEW;
      }
      step = Main.config.first_step || LOT_STEP_REGISTRATION;
    }
    return step;
  },

  getCurrentLot : function (r) {
    var lot = null;

    if (r.hasOwnProperty('data')
      && r.data.hasOwnProperty('lots')
      && r.data.lots.length > 0
    ){
      lot = r.data.lots[0];
    }

    return lot;
  },
          
  isTypeRetrade: function(procedure_type) {
    var groups = Application.models.Procedure.groups.retrades;
    if (Main.config.qualification_as_retrade === true) {
      groups.push(Application.models.Procedure.type_ids.qualification);
    }
    return Application.models.Procedure.groups.retrades.indexOf(procedure_type)>=0 ? true : false;
  },

  getButtonSelectTreeWnd: function(title, type, keyName, searchHelp, selFunc, isDisabled) {
    return {
      xtype: 'button',
      text: 'Выбрать',
      scope: this,
      disabled: isDisabled,
      handler: function () {
        var winTree = new Application.components.treeWindow(
          {
            width: 700,
            height: 400,
            autoSize: true,
            loaderConfig: {
              type: type,
              rootName: '0',
              directFn: null,
              directSearchFn: null,
              textFormat: '{0} {1}',
              search: true,
              searchHelp: searchHelp
            },
            title: title,
            type: type,
            keyName: keyName,
            listeners: {
              scope: this,
              itemselected: selFunc
            }
          });
        winTree.show();
      }
    };
  }
}