Ext.define('Application.components.po_applicationsReviewFormNew', {
  extend: 'Application.components.applicationsReviewForm',
  module: 'po',
  title_names: {
    '1': 'Рассмотрение заявок на участие',
    '2': 'Рассмотрение и оценка заявок',
    '3': 'Подпись протокола проведения аукциона',
    '4': 'Подпись протокола проведения переторжки',
    'decline': 'Отстранения участников',
    '6': 'Подведение итогов предварительного отбора',
    'supplier_info_tooltip': 'Сведения о заявителе',
    'supplier_info_text': 'Сведения о заявителе',
    'panel1_stage1': 'Решение членов комиссии о допуске участника',
    'panel1_stage2': 'Решение членов комиссии о допуске участника',
    'protocol_actual_descr': ''
  },
    procedureTypeTitleNames: {
      '3' : {
        '1' : 'Рассмотрение заявок',
        '2' : 'Оценка и сопоставление'
      }
    },
  protocol_names: {
    '1': 'Протокол рассмотрения заявок на участие',
    '2': 'Протокол рассмотрения и допуска',
    '3': 'Протокол проведения аукциона',
    '4': 'Протокол проведения переторжки',
    'decline': 'Протокол отстранения участников',
    '6': 'Протокол квалификационного отбора'
  },
    procedureTypeProtocolNames: {
        '2' : {
          '2' : 'Протокол подведения итогов'
        },
        '3' : {
          '1' : 'Протокол рассмотрения заявок',
          '2' : 'Протокол оценки и сопоставления'
      }
    },
  downloadHref: 'po/protocol/download',

    setPanelsTitles: function(protocolType, procedureType) {
        if (this.procedureTypeTitleNames[procedureType] != undefined &&
            this.procedureTypeTitleNames[procedureType][protocolType] != undefined) {
            this.setTitle(this.procedureTypeTitleNames[procedureType][protocolType]);
        }

        this.protocolFilePanel.items.each(function(fieldset) {
            if (this.procedureTypeProtocolNames[procedureType] != undefined &&
                this.procedureTypeProtocolNames[procedureType][protocolType] != undefined) {
                fieldset.setTitle(this.procedureTypeProtocolNames[procedureType][protocolType]);
            }
        }, this);

    }

  ,initComponent: function() {
    this.evaluationCriteriaStore = Application.models.Po_Lot.getEvaluationCriterionListFromRPC();
    this.evaluationCriteriaStore.reload();
    Application.components.po_applicationsReviewForm.superclass.initComponent.call(this);

    this.addListener('applic_reviewlist_loaded', function(result) {
        var protocolType = this.act == 'decline' ? 'decline' : ('' + this.stage);
        this.setPanelsTitles(protocolType, result.procedure.procedure_type);
    }, this);

  }
  ,getFormApi: function(){
    return {
      submit: RPC_po.Applic.saveReviewApplication
    };
  }
  ,getProcTpl: function(procedure){
    return getPoProcedureDataTemplate().apply(procedure);
  }
  ,loadApplicReviewList: function(){
    var component = this;
    performRPCCall(
      RPC_po.Applic.reviewlist,
      [{lot_id: component.lot_id, stage: component.stage}],
      {wait_delay: NO_MAGIC_NUMBER_ZERO, wait_text: 'Загружаются заявки. Подождите...'},
      function(result) {
        if (result.success) {
          component.fireEvent('loadedApplicReviewList', result);
          if (result.criterions) {
            component.criterions = result.criterions;
          }
          if (result.min_price) {
            component.min_price = result.min_price * NO_MAGIC_NUMBER_ONE;
          }
          if (result.max_price) {
            component.max_price = result.max_price * NO_MAGIC_NUMBER_ONE;
          }
          if (result.criteria_marks) {
            component.criteria_marks = result.criteria_marks;
          }
        } else {
          echoResponseMessage(result);
          redirect_to(component.module + '/procedure/index');
        }
      });
  }
  ,datagridStoreSave: function(component, datagrid){
    var applic_grid_store = Ext.getCmp(component.applic_grid_id).getStore();
    for (var i = NO_MAGIC_NUMBER_ZERO; i < component.applications.length; ++i) {
      var r = applic_grid_store.getById(component.applications[i].app_id);
      if (r) {
        var place = false;
        if (NO_MAGIC_NUMBER_ONE === component.applications.length) {
          place = NO_MAGIC_NUMBER_ONE;
          component.updateRating(r,component);
        }else{
          if (Application.models.Procedure.groups.requests.indexOf(component.procedure_type)) {
            component.updateRating(r,component);
          }
          place = component.applications[i].order_number_assigned;
        }
        if (place && place > 0 && APPLICATION_STATUS_PROCESSED == component.applications[i].status) {
          r.set('order_number_assigned', place);
        } else if (APPLICATION_STATUS_DECLINED == component.applications[i].status) {
          r.set('order_number_assigned', NO_MAGIC_NUMBER_MINUS_ONE);
        }
      }
    }
    datagrid.getStore().save();
  }
  ,addFilesPanel: function(component,protocol_type){
    component.add({
      xtype: 'Application.components.FilesPanel',
      id: component.fileFieldsetId,
      border: false,
      onlyOne: true,
      required: true,
      errMsg: 'Приложите протокол',
        ref: 'protocolFilePanel',
      file_panels: [{
        name: 'Загрузка протокола',
        xtype: 'fieldset',
        withDescr: false,
        descr: '<p style="margin: 0px; font-size: 7pt;">Если ваш документ многостраничный, то размещайте сканы в архиве, либо в документ Word.</p>',
        req_id: NO_MAGIC_NUMBER_ONE
      }]
    });
  },
  createCriteriaPanel: function(component, record, commission_members, store) {
    var currentStep = this.procedure.lots[0].lot_step;
    var procedureType = this.procedure_type;
    if (PSEUDO_STEP_CONSIDERATION_DEMAND != currentStep &&
        !(procedureType == PROCEDURE_TYPE_AUCTION && currentStep == PSEUDO_STEP_CONTRACT_SUMARIZE)) {
      var panel = new Application.components.ApplicationCriterionPanel({
        id: 'panel3_' + record.get('id'),
        hidden: getFieldValue('commission_decision_no_' + record.get('id')) || !getFieldValue('commission_decision_yes_' + record.get('id')),
        component: component,
        application: record,
        comissionMembers: commission_members,
        listeners: {
          afterrender: function () {
            store.each(function (record) {
              component.updateRating(record, component);
            });
          },
          hide: function () {
            store.each(function (record) {
              component.updateRating(record, component);
            });
          },
          show: function () {
            store.each(function (record) {
              component.updateRating(record, component);
            });
          }
        }
      });
      panel.doLayout();
      component.updateRating(record, component);
    }
    return panel;
  },

  getMinFieldValue: function(component) {
    var minFieldValue = [];

    for (var crIndex = 0; crIndex < component.criterions.length; ++crIndex) {
      var fieldRelation = component.criterions[crIndex].field_relation;

      if (!fieldRelation) {
        continue;
      }

      for (var appIndex = 0; appIndex < component.applications.length; ++appIndex) {
        if (!component.applications[appIndex].hasOwnProperty(fieldRelation) ||
            !getFieldValue('commission_decision_yes_' + component.applications[appIndex].id)) {
          continue;
        }

        minFieldValue[fieldRelation] =
            minFieldValue[fieldRelation] || component.applications[appIndex][fieldRelation];
        minFieldValue[fieldRelation] =
            Math.min(minFieldValue[fieldRelation], component.applications[appIndex][fieldRelation]);
      }
    }

    return minFieldValue;
  }

  ,updateRating: function(record,component) {
    var application_id = record.get('app_id');
    var commission_form = Ext.getCmp(component.commission_form_id);
    var commission_members = commission_form.getCommissionMembers();
    var total = NO_MAGIC_NUMBER_ZERO;
    var totalRatings = {};
    var criterions = component.criterions || [];

    var minFieldValue = component.getMinFieldValue(component);

    for (var i = NO_MAGIC_NUMBER_ZERO; i < commission_members.length; ++i) {
      var member_id = commission_members[i].id;
      if (!commission_members[i].can_vote ||
          (Ext.getCmp('member_attended_' + member_id) && !Ext.getCmp('member_attended_' + member_id).getValue())
      ) {
        continue;
      }
      for (var j = NO_MAGIC_NUMBER_ZERO; j < criterions.length; ++j) {
        var criterionsPanel = Ext.getCmp('panel3_' + record.get('id'));
        if (criterionsPanel) {
          var criterionIndex = application_id + '_'
              + member_id + '_' + criterions[j].id;
          var weight = Ext.getCmp('criterion_weight_' + criterionIndex);
          var criterionScore = criterionsPanel.getCriterionScore(application_id, member_id, criterions[j], minFieldValue);
          setFieldValue('criterion_mark_' + criterionIndex, criterionScore);
          setFieldValue('criterion_rating_' + criterionIndex, criterionScore * weight.getValue() / HUNDRED_PERCENTS);
        }
        var ratingFld_id = 'criterion_rating_' + application_id + '_'
          + member_id + '_' + criterions[j].id;
        var cur = Ext.getCmp(ratingFld_id);
        // если не проставлен балл, то не считаем итоговый рейтинг
        if (totalRatings[criterions[j].id] == undefined) {
          totalRatings[criterions[j].id] = [];
        }
        if (cur && cur.getValue()!=null) {
          totalRatings[criterions[j].id].push(NO_MAGIC_NUMBER_ONE * cur.getValue());
        }else{
          totalRatings[criterions[j].id] = null;
        }
      }
    }
    total = Application.models.criterion_calculation.calculateAvgTotalRating(totalRatings);
    if (total) {
      total = Math.round(total * parseInt('100')) / parseInt('100');
    }
    setFieldValue('total_rating_' + record.get('id'),total);
    var app_id = record.get('app_id');
    for (var i = 0; i < component.applications.length; ++i) {
      if (app_id === component.applications[i].app_id) {
        component.applications[i].rating = total;
      }
    }
    var ratings = new Array();
    var processed_cnt = 0;
    // массив номеров заявок с рейтингами и датой подачи
    for (var i = 0; i < component.applications.length; ++i){
      if (getFieldValue('commission_decision_yes_' + component.applications[i].id)) {
        processed_cnt++;
        component.applications[i].status = APPLICATION_STATUS_PROCESSED; //  const STATUS_PROCESSED = 3;  // принята
        var rating_value = null;
        var total_rating_fld =  Ext.getCmp('total_rating_' + component.applications[i].id);
        if (total_rating_fld && total_rating_fld.getValue()) {
          rating_value = NO_MAGIC_NUMBER_ONE * total_rating_fld.getValue();
        }else{
          // если нет критериев и, соответственно, баллов, то ранжируем по возрастанию цены
          rating_value = NO_MAGIC_NUMBER_MINUS_ONE * component.applications[i].price;
        }
        if (rating_value){
          ratings.push({'app_id': component.applications[i].app_id, 'value': rating_value, 'date': component.applications[i].date});
        }
      }else{
        component.applications[i].status = APPLICATION_STATUS_DECLINED;
      }
    }
    // сортировка по убыванию
    if (ratings.length === processed_cnt) {//component.applications.length) {
      ratings.sort(function(a,b){
        if (b["value"] === a["value"]) {
          return (b["date"] < a["date"]);
        }else{
          return (b["value"] - a["value"]);
        }
      });
      for (var i = 0; i < component.applications.length; ++i){
        var place = 0;
        if (APPLICATION_STATUS_PROCESSED == component.applications[i].status) {
          for (var j = 0; j < ratings.length; ++j){
            if (component.applications[i].app_id === ratings[j].app_id) {
              place = j + 1;
              j = ratings.length + 1;
            }
          }
        }
        setFieldValue('total_place_' + component.applications[i].id, place);
        component.applications[i].order_number_assigned = place;
      }
    }
  }
  ,createRatingsPanel: function(component, record) {
    return new Ext.Panel({
      frame: true,
      labelWidth: 400,
      layout: 'form',
      bodyCssClass: 'cleanborder',
      defaults: {
        border: false,
        bodyCssClass: 'cleanborder'
      },
      bodyStyle: 'padding-left: 4px',
      style: {marginBottom: '10px'},
      items: [
        { xtype: 'Application.components.numberField',
          decimalPrecision: null,
          id: 'total_rating_' + record.get('id'),
          fieldLabel: '<b>Итоговый рейтинг заявки</b>',
          readOnly: true,
          name: 'total_rating[' + record.get('id') + ']'
        }
        , { xtype: 'textfield',
          id: 'total_place_' + record.get('id'),
          fieldLabel: '<b>Место заявки в соответствии с итоговым рейтингом</b>',
          readOnly: true,
          name: 'total_place[' + record.get('app_id') + ']'
        }
      ]
    });
  }
  ,protocolStore: function(procedure){
    return new Ext.data.DirectStore({
      autoDestroy: true,
      directFn: RPC_po.Reference.listProtocols,
      autoLoad: false,
      root: 'rows',
      idProperty: 'code',
      fields: ['code', 'name']
    });
  },
  getValidCodes: function() {
    var validCodes = [];
    switch (this.stage) {
      case STAGE_REVIEW:
        validCodes = ['PREA44', 'PPEOKD44', 'PVKOK44', 'PPO44', 'PPZP44', 'PREOKU44', 'PROOK44', 'PREOK44', 'PZK44', 'PPZK44','PROOKD44', 'PREOKD44', 'PREOKU44', 'PROOKU44', 'PRZEA44'];
        break;
      case STAGE_RESULT:
        validCodes = ['PREA44', 'PROOK44', 'PREOK44', 'PZK44', 'PPZK44', 'PPZP44', 'PROOKD44', 'PREOKU44', 'PREOKU44', 'PROOKU44', 'PRZEA44'];
        break;
      case 3:
        validCodes = ['PPEA44', 'PPIEA44'];
        break;
      case 4:
        validCodes = [];
        break;
      case STAGE_QUALIFICATION:
        validCodes = ['PPOOKD44', 'PPOOKU44', 'PPO44'];
        break;
    }
    return validCodes;
  },
  checkOosBlock: function() {
    var values = {};
    collectComponentValues(Ext.getCmp(this.oos_fieldset_id), values, false, false);
    values['oos_type_id'] = Ext.getCmp(this.oos_type_combo_id).getValue();
    var hasEmpty = false;
    for (var key in values) {
      if (key != 'oos_exchange_cancelled' && Ext.isEmpty(values[key])) {
        hasEmpty = true;
      }
    }
    if (!hasEmpty) {
      Ext.getCmp(this.oos_fieldset_id).setVisible(false);
    }
  },
  fillOosStore: function(data) {
    this.oos_type_store.on('load', function(store, records) {
      var validCodes = this.getValidCodes(this.stage);
      var selectedCode = null;
      Ext.each (validCodes, function(code) {
        var record = store.getById(code);
        if (record && !selectedCode) {
          selectedCode = code;
        }
      });
      if (selectedCode) {
        Ext.getCmp(this.oos_type_combo_id).setValue(selectedCode);
        this.checkOosBlock();
      }
    }, this);
    this.oos_type_store.load({params: {procedure_type: data.procedure.procedure_type}});
  }
});

Ext.onReady(function () {

  var initComponent = Application.components.po_applicationsReviewForm.prototype.initComponent;

  Ext.override(Application.components.po_applicationsReviewForm, {
    initComponent: function () {
      var cmp = this;
      initComponent.apply(this);

      this.on('reloadFilePanels', function () {
        if (Application.models.Procedure.groups.offers.indexOf(cmp.procedure_type) >= 0) {
          var file_fieldset = Ext.getCmp(cmp.fileFieldsetId);
          var autogenerated_file = Ext.getCmp(cmp.autogenerated_file_id);
        }
      }, this, {once: true});
    }
  });
});