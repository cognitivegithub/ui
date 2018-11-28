/**
 * Created by ildar on 16.09.15.
 */
Ext.define('Application.components.ApplicationCriterionPanel', {
  extend: 'Ext.Panel',
  frame: true,
  bodyCssClass: 'cleanborder',
  title: 'Оценка заявки',
  component: null,
  application: null,
  comissionMembers: null,
  initComponent: function () {
    var cmp = this;
    var items = [];
    var application_id = this.application.get('app_id');
    if (this.comissionMembers && this.component.criterions) {
      var minFieldValue = this.component.getMinFieldValue(this.component);

      this.application = Application.models.criterion_calculation.calculate(
        this.application,
        this.component.criterions,
        this.component.applications
      );
      for (var i = 0; i < this.comissionMembers.length; ++i) {
        var member_id = this.comissionMembers[i].id;
        if (!this.comissionMembers[i].can_vote || !Ext.getCmp('member_attended_' + member_id).getValue()) {
          continue;
        }
        var panel1 = this.component.getTableLayoutPanel(2, true, (0 === i ? [
          {cellCls: 'th_width_150',
            html: '<b>Член комиссии</b>'
          }
          , {cellCls: 'th_width_150',
            html: '<b>Роль</b>'
          }] : null));
        panel1.add({
          cellCls: 'th_width_150',
          html: this.comissionMembers[i].name
        });
        panel1.add({
          cellCls: 'th_width_150',
          html: this.comissionMembers[i].role
        });
        var p = this.component.getTableLayoutPanel(4, false, [
          {cellCls: 'width_400px', html: '<b>Критерий</b>'}
          ,{cellCls: 'th_width_50', html: '<b>Значимость</b>'}
          ,{cellCls: 'th_width_50', html: '<b>Баллы</b>'}
          ,{cellCls: 'th_width_50', html: '<b>Рейтинг</b>'}
        ]);
        var criterions = this.component.criterions;

        for (var k = 0; k < criterions.length; ++k) {
          var criterion_id = criterions[k].id;
          var code = this.component.evaluationCriteriaStore.getById(criterions[k].code);
          p.add(
            {
              html: (k + 1) + '. ' + code.get('name')
            }

            , {
              xtype: 'numberfield',
              decimalPrecision: null,
              hideLabel: true,
              allowNegative:false,
              allowBlank: true,
              minLength: 1,
              width: 40,
              value: criterions[k].criterion_weight,
              style: 'margin-bottom: 4px',
              stateful: true,
              readOnly: true,
              id: 'criterion_weight_' + application_id + '_' + member_id + '_' + criterion_id,
              stateId: 'criterion_weight_' + application_id + '_' + member_id + '_' + criterion_id,
              stateEvents: ['blur'],
              getState: function () {
                return {value: this.getValue()};
              },
              ref: 'criterion_weight'
            }
            , {
              xtype: 'numberfield',
              hideLabel: true,
              allowNegative:false,
              decimalPrecision: 2,
              width: 40,
              readOnly: code.id == 'CP' || criterions[k].field_relation,
              id: 'criterion_mark_' + application_id + '_' + member_id + '_' + criterion_id,
              style: 'margin-bottom: 4px',
              name: 'criterion_marks[' + application_id + '_' + member_id + '_' + criterion_id + ']',
              value: this.getCriterionScore(application_id, member_id, criterions[k], minFieldValue),
              minValue: 0,
              maxValue: 100,
              allowBlank: true,
              minLength: 1,
              stateful: true,
              ref: 'criterion_mark',
              stateId: 'criterion_mark_' + application_id + '_' + member_id + '_' + criterion_id,
              criterionPath: application_id + '_' + member_id + '_' + criterion_id,
              stateEvents: ['blur'],
              getState: function () {
                return {value: this.getValue()};
              },
              listeners: {
                change: function () {
                  var index = this.id.substr('criterion_mark'.length);
                  var el = Ext.getCmp('criterion_rating' + index);
                  if (this.getValue()!=null && !this.getActiveError()) {
                    var weight = Ext.getCmp('criterion_weight' + index);
                    el.setValue(this.getValue() * weight.getValue() / 100);
                  } else {
                    this.setValue(null);
                    el.setValue(null);
                  }
                  cmp.component.updateRating(cmp.application, cmp.component);

                  var applicGridStore = Ext.getCmp(cmp.component.applic_grid_id).getStore();
                  for (var i = 0; i < cmp.component.applications.length; ++i) {
                    var r = applicGridStore.getById(cmp.component.applications[i].app_id);
                    if (r) {
                      var place = false;

                      if (NO_MAGIC_NUMBER_ONE === cmp.component.applications.length) {
                        place = cmp.component.applications.length;
                      } else {
                        place = cmp.component.applications[i].order_number_assigned;
                      }

                      if (place && APPLICATION_STATUS_PROCESSED == cmp.component.applications[i].status) {
                        r.set('order_number_assigned', place);
                      } else {
                        r.set(
                          'order_number_assigned',
                          APPLICATION_STATUS_DECLINED == cmp.component.applications[i].status
                            ? NO_MAGIC_NUMBER_MINUS_ONE
                            : NO_MAGIC_NUMBER_ZERO
                        );
                      }
                    }
                  }
                },
                afterrender: function () {
                  var index = this.id.substr('criterion_mark'.length);
                  var el = Ext.getCmp('criterion_rating' + index);
                  if (this.getValue()!=null && !this.getActiveError()) {
                    var weight = Ext.getCmp('criterion_weight' + index);
                    el.setValue(this.getValue() * weight.getValue() / 100);
                  } else {
                    this.setValue(null);
                    el.setValue(null);
                  }
                  cmp.component.updateRating(cmp.application, cmp.component);
                },
                updateByIndicators: function () {
                  var mark = 0;
                  this.ownerCt.items.each(function (item) {
                    if (item.criterionMark && item.criterionMark == this.id) {
                      mark += item.getValue();
                    }
                  }, this);
                  this.setValue(mark);
                  this.fireEvent('change');
                }
              }
            }
            , {
              xtype: 'numberfield',
              decimalPrecision: 2,
              allowNegative:false,
              allowBlank: true,
              minLength: 1,
              hideLabel: true,
              width: 40,
              readOnly: true,
              id: 'criterion_rating_' + application_id + '_' + member_id + '_' + criterion_id,
              style: 'margin-bottom: 4px; border: 2px solid black;',
              stateful: true,
              stateId: 'criterion_rating_' + application_id + '_' + member_id + '_' + criterion_id,
              ref: 'criterion_rating',
              stateEvents: ['blur'],
              getState: function () {
                return {value: this.getValue()};
              }
            }
          );
          if (criterions[k].po_model_criterionindicator && criterions[k].po_model_criterionindicator.length) {
            var indicatorScoreSum = 0;
            var indicatorNormedScoreSum = 0;
            Ext.each(criterions[k].po_model_criterionindicator, function (indicator, index) {
              var indicatorScore = this._getIndicatorScore(application_id, member_id, criterions[k].criterion_code, this.application.json.po_model_applicationcriterionvalues, indicator.id);
              var indicatorNormedScore = Application.models.criterion_calculation.calcNormedScore(
                indicatorScore,
                indicator.value
              );
              indicatorScoreSum += indicatorScore;
              indicatorNormedScoreSum += indicatorNormedScore;
              p.add(
                {
                  style: 'padding-left:20px',
                  html: (k + 1) + '.' + (index + 1) + '. ' + indicator.name
                }
                , {
                  xtype: 'numberfield',
                  decimalPrecision: null,
                  hideLabel: true,
                  width: 90,
                  //readOnly: true,
                  style: 'margin-bottom: 4px',
                  id: 'criterion_indicator_offer_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  name: 'criterion_indicator_offer[' + this._getIndicatorId(criterions[k].criterion_code, this.application.json.po_model_applicationcriterionvalues, indicator.id) + ']',
                  value: this._getIndicatorOffer(criterions[k].criterion_code, this.application.json.po_model_applicationcriterionvalues, indicator.id),
                  addInfo: this._getIndicatorAddInfo(criterions[k].criterion_code, this.application.json.po_model_applicationcriterionvalues, indicator.id),
                  stateful: true,
                  listeners: {
                    afterrender: function() {
                      if (this.addInfo) {
                        var helpImage = this.getEl().up('.x-table-layout-cell').createChild({
                          tag: 'img',
                          src: '/images/icons/silk/information.png',
                          style: 'margin-bottom: 0px; margin-left: 5px; padding: 0px;',
                          width: 16,
                          height: 16
                        });
                        Ext.QuickTips.register({
                          target: helpImage,
                          title: '',
                          text: this.addInfo,
                          enabled: true
                        });
                        Ext.QuickTips.init();
                      }
                    },
                    change: function(applicationId, memberId, criterionCode, indicatorId) {
                      return function(field) {
                        var value = field.getValue();
                        if (Ext.isEmpty(value)) {
                          value = 0;
                        } else {
                          value = parseFloat(value);
                        }
                        cmp._setIndicatorOffer(criterionCode, cmp.application.json.po_model_applicationcriterionvalues, indicatorId, value);
                        cmp.application = Application.models.criterion_calculation.calculate(
                          cmp.application,
                          cmp.component.criterions,
                          cmp.component.applications
                        );
                        var index = this.id.substr('criterion_indicator_offer'.length);
                        var el = Ext.getCmp('criterion_indicator_mark' + index);
                        var indicatorScore = cmp._getIndicatorScore(applicationId, memberId, criterionCode, cmp.application.json.po_model_applicationcriterionvalues, indicatorId);
                        el.setValue(indicatorScore);
                        updateItems(cmp);
                      }
                    }(application_id, member_id, criterions[k].criterion_code, indicator.id),
                    updateValue: function(criterionCode, indicatorId) {
                      return function() {
                        var value = cmp._getIndicatorOffer(criterionCode, cmp.application.json.po_model_applicationcriterionvalues, indicatorId);
                        this.setValue(value);
                      }
                    }(criterions[k].criterion_code, indicator.id)
                  }
                }
                , {
                  xtype: 'numberfield',
                  decimalPrecision: null,
                  allowNegative:false,
                  allowBlank: true,
                  minLength: 1,
                  hideLabel: true,
                  width: 40,
                  value: indicator.value,
                  readOnly: true,
                  id: 'criterion_indicator_weight_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  style: 'margin-bottom: 4px',
                  name: 'criterion_indicator_weight[' + application_id + '][' + member_id + '][' + criterion_id + '][' + indicator.id + ']',
                  stateful: true,
                  stateId: 'criterion_weight_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  stateEvents: ['blur'],
                  getState: function () {
                    return {value: this.getValue()};
                  }
                }
                , {
                  xtype: 'numberfield',
                  hideLabel: true,
                  allowNegative:false,
                  decimalPrecision: null,
                  width: 40,
                  //readOnly: k === 0 ? true : false,
                  id: 'criterion_indicator_mark_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  style: 'margin-bottom: 4px',
                  name: 'criterion_marks[' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id + ']',
                  minValue: 0,
                  maxValue: 100,
                  allowBlank: true,
                  minLength: 1,
                  stateful: true,
                  stateId: 'criterion_indicator_mark_' + this.component.stage + this.component.lot_id + '_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  stateEvents: ['blur'],
                  value: indicatorScore,
                  getState: function () {
                    return {value: this.getValue()};
                  },
                  listeners: {
                    change: function () {
                      var index = this.id.substr('criterion_indicator_mark'.length);
                      var el = Ext.getCmp('criterion_indicator_rating' + index);
                      if (this.getValue()!=null && !this.getActiveError()) {
                        var weight = Ext.getCmp('criterion_indicator_weight' + index);
                        el.setValue(this.getValue() * weight.getValue() / 100);
                      } else {
                        this.setValue(null);
                        el.setValue(null);
                      }
                      Ext.getCmp(el.criterionMark).fireEvent('updateByIndicators');
                      //this.component.updateRating(this.application, this.component);
                    },
                    updateValue: function(applicationId, memberId, criterionCode, indicatorId) {
                      return function() {
                        var value = cmp._getIndicatorScore(applicationId, memberId, criterionCode, cmp.application.json.po_model_applicationcriterionvalues, indicatorId);
                        if (value != null) {
                          this.setValue(value);
                          this.fireEvent('change');
                        }
                      }
                    }(application_id, member_id, criterions[k].criterion_code, indicator.id)
                  }
                }
                , {
                  xtype: 'numberfield',
                  decimalPrecision: null,
                  allowNegative:false,
                  hideLabel: true,
                  allowBlank: true,
                  minLength: 1,
                  width: 40,
                  value: indicatorNormedScore,
                  readOnly: true,
                  criterionMark: 'criterion_mark_' + application_id + '_' + member_id + '_' + criterion_id,
                  id: 'criterion_indicator_rating_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  style: 'margin-bottom: 4px',
                  stateful: true,
                  stateId: 'criterion_indicator_rating_' + application_id + '_' + member_id + '_' + criterion_id + '_' + indicator.id,
                  stateEvents: ['blur'],
                  getState: function () {
                    return {value: this.getValue()};
                  }
                }
              );
            }, this);
            var criterionMark = Ext.getCmp('criterion_mark_' + application_id + '_' + member_id + '_' + criterion_id);
            criterionMark.setValue(indicatorNormedScoreSum);
            criterionMark.fireEvent('change', indicatorNormedScoreSum);
          }
        }
        items.push(panel1);
        items.push(p);
      }
    }
    items.push(this.component.createRatingsPanel(this.component, this.application));
    Ext.apply(this,{
      items: items
    });
    function updateItems(cmp) {
      if (!cmp) {
        return;
      }
      if (cmp.items) {
        if (cmp.items instanceof Ext.util.MixedCollection) {
          cmp.items.each(function(item){
            updateItems(item);
          });
        } else {
          Ext.each(cmp.items, function (item) {
            updateItems(item);
          });
        }
      } else {
        cmp.fireEvent('updateValue');
      }
    }
    updateItems(this);
    Application.components.ApplicationCriterionPanel.superclass.initComponent.call(this);
  },

  _getScore: function (application_id, member_id, criterionCode, criterionValues) {
    var score = 0;
    var index = application_id + '_' + member_id + '_' + criterionCode;
    if (this.component.criteria_marks[index]) {
      score = this.component.criteria_marks[index];
    } else {
      Ext.each(criterionValues, function (value) {
        if (value.code == criterionCode) {
          score = value.score;
        }
      });
    }
    if (score)
      score = Math.round(score * 100) / 100; // округлим
    return score;
  },
  _getOffer: function(criterionCode, criterionValues) {
    var offer = '';
    Ext.each(criterionValues, function(value){
      if (value.code == criterionCode) {
        offer = value.offer;
      }
    });
    return offer;
  },
  _getIndicatorScore: function(application_id, member_id, criterionCode, criterionValues, criterionIndicatorId) {
    var score = '';
    var index = application_id + '_' + member_id + '_' + criterionCode + '_' + criterionIndicatorId;
    if (this.component.criteria_marks[index]){
      score = this.component.criteria_marks[index];
    } else {
      Ext.each(criterionValues, function (value) {
        if (value.criterion_code == criterionCode) {
          Ext.each(value.po_model_criterionindicatorvalues, function (indicatorValue) {
            if (indicatorValue.criterion_indicator_id == criterionIndicatorId) {
              score = indicatorValue.score;
            }
          });
        }
      });
    }
    if (score)
      score = Math.round(score * 100) / 100; // округлим
    return score;
  },
  _getIndicatorOffer: function(criterionCode, criterionValues, criterionIndicatorId) {
    var offer = '';
    Ext.each(criterionValues, function(value){
      if (value.criterion_code == criterionCode) {
        Ext.each(value.po_model_criterionindicatorvalues, function(indicatorValue) {
          if (indicatorValue.criterion_indicator_id == criterionIndicatorId) {
            offer = indicatorValue.offer;
          }
        });
      }
    });
    return offer;
  },
  _getIndicatorId: function(criterionCode, criterionValues, criterionIndicatorId) {
    var id = null;
    Ext.each(criterionValues, function(value){
      if (value.criterion_code == criterionCode) {
        Ext.each(value.po_model_criterionindicatorvalues, function(indicatorValue) {
          if (indicatorValue.criterion_indicator_id == criterionIndicatorId) {
            id = indicatorValue.id;
          }
        });
      }
    });
    return id;
  },
  _setIndicatorOffer: function(criterionCode, criterionValues, criterionIndicatorId, offer) {
    Ext.each(criterionValues, function(value){
      if (value.criterion_code == criterionCode) {
        Ext.each(value.po_model_criterionindicatorvalues, function(indicatorValue) {
          if (indicatorValue.criterion_indicator_id == criterionIndicatorId) {
            indicatorValue.offer = offer;
          }
        });
      }
    });
    return offer;
  },
  _getIndicatorAddInfo: function(criterionCode, criterionValues, criterionIndicatorId) {
    var addInfo = '';
    Ext.each(criterionValues, function(value){
      if (value.criterion_code == criterionCode) {
        Ext.each(value.po_model_criterionindicatorvalues, function(indicatorValue) {
          if (indicatorValue.criterion_indicator_id == criterionIndicatorId) {
            addInfo = indicatorValue.add_info;
          }
        });
      }
    });
    return addInfo;
  },
  getCriterionScore: function (application_id, member_id, criterion, minFieldValue) {
    var criterionScore = this._getScore(application_id, member_id, criterion.criterion_code, this.application.json.po_model_applicationcriterionvalues);

    if (this.application.data.hasOwnProperty(criterion.field_relation)
        && this.application.data[criterion.field_relation] > 0
        && minFieldValue.hasOwnProperty(criterion.field_relation)
    ) {
      criterionScore = Math.round(
          minFieldValue[criterion.field_relation] /
          this.application.data[criterion.field_relation] *
          HUNDRED_PERCENTS * HUNDRED_PERCENTS) / HUNDRED_PERCENTS;
    }
    return criterionScore;
  }
});