/**
 * Created by ildar on 14.09.15.
 */
Application.models.criterion_calculation = {
  CPMin: null,    //минимальная цена
  CPMax: null,    //максимальная цена
  /**
   * Расчет score, normedScore для всех критериев оценки
   * @param application
   * @param criterions
   * @param applications
   */
  calculate: function (application, criterions, applications) {
    var criterionValues = [];
    Ext.each(application.json.po_model_applicationcriterionvalues, function (criterionValue) {
      var code = criterionValue.criterion_code;
      switch (code) {
        case 'CP':  //Цена контракта
        case 'TC':  //Стоимость жизненного цикла товара или созданного в результате выполнения работы объекта
          criterionValue = this._calcPrice(criterionValue, criterions, applications);
          break;
        case 'MC':  //Расходы на эксплуатацию и ремонт товаров, использование результатов работ
        case 'EN':  //Предложение о сумме соответствующих расходов заказчика, которые заказчик осуществит или понесет по энергосервисному контрактy
          criterionValue = this._calcExpenses(criterionValue, criterions, applications);
          break;
        case 'QF':  //Качественные, функциональные и экологические характеристики объекта закупки
        case 'QO':  //Квалификация участников закупки
          criterionValue = this._calcQualitative(criterionValue, criterions, applications);
          break;
      }
      criterionValues.push(criterionValue);
    }, this);
    application.json.po_model_applicationcriterionvalues = criterionValues;
    return application;
  },
  /**
   * Расчет критерия оценки по средним значениям членов комиссии
   *
   * @param totalRatings
   * @returns {*}
   */
  calculateAvgTotalRating: function(totalRatings) {
    var total = 0;
    for (var criterionCode in totalRatings) {
      if (totalRatings[criterionCode] == null) {
        return null;
      }
      var members = totalRatings[criterionCode].length;
      var avgTotal = 0;
      Ext.each(totalRatings[criterionCode], function(item) {
        avgTotal += item;
      });
      total += avgTotal/members;
    }
    return total;
  },
  /**
   * Расчет балла для денежных критериев:
   *  Цена контракта
   *  Стоимость жизненного цикла товара или созданного в результате выполнения работы объекта
   *
   * @param criterionValue
   * @param criterions
   * @param applications
   * @returns {*}
   * @private
   */
  _calcPrice: function (criterionValue, criterions, applications) {
    var code = criterionValue.criterion_code;
    var mark = null;
    var minPrice = this._getCodeMin(applications, code);
    if (minPrice > 0) {
      //Пункт 16 а
      mark = (minPrice / criterionValue.offer) * 100;
    } else {
      //Пункт 16 б
      var maxPrice = this._getCodeMax(applications, code);
      mark = (maxPrice - criterionValue.offer) / maxPrice * 100;
    }
    var criterionData = this._getCriterionData(criterions, code);
    criterionValue.score = mark;
    criterionValue.normed_score = this.calcNormedScore(mark, criterionData.value);
    return criterionValue;
  },
  /**
   * Расчет балла для денежных критериев:
   *  Расходы на эксплуатацию и ремонт товаров, использование результатов работ
   *  Предложение о сумме соответствующих расходов заказчика, которые заказчик осуществит или понесет по энергосервисному контрактy
   *
   * @param criterionValue
   * @param criterions
   * @param applications
   * @returns {*}
   * @private
   */
  _calcExpenses: function (criterionValue, criterions, applications) {
    //Пункт 17
    var code = criterionValue.code;
    var mark, min;
    min = this._getCodeMin(applications, code);
    mark = min / criterionValue.offer * 100;
    var criterionData = this._getCriterionData(criterions, code);
    criterionValue.score = mark;
    criterionValue.normed_score = this.calcNormedScore(mark, criterionData.value);
    return criterionValue;
  },
  /**
   * Расчет балла для качественного показателя
   *
   * @param criterionValue
   * @param criterions
   * @param applications
   * @returns {*}
   * @private
   */
  _calcQualitative: function (criterionValue, criterions, applications) {
    var mark = null;
    var code = criterionValue.criterion_code;
    var criterionIndicatorValue = criterionValue.po_model_criterionindicatorvalues[0];
    var criterionIndicatorId = criterionValue.po_model_criterionindicatorvalues[0].criterion_indicator_id;
    var criterionIndicatorData = this._getCriterionIndicatorData(criterions, code, criterionIndicatorId);
    var measurementOrderCode = criterionIndicatorData.measurement_order_code;
    switch (measurementOrderCode) {
      case 'F':   //лучшим условием исполнения контракта является наибольшее значение
        var indicatorMax = this._getIndicatorMaxOffer(applications, code, criterionIndicatorId);
        if (criterionIndicatorData.limit) {
          if (criterionIndicatorValue.offer >= criterionIndicatorData.limit) {
            //участникам закупки, сделавшим предложение, соответствующее такому значению,
            //или лучшее предложение, присваивается 100 баллов
            mark = 100;
          } else {
            if (criterionIndicatorValue.offer == 0) {
              mark = 0;
            } else if (indicatorMax < criterionIndicatorData.limit) {
              //Пункт 24 а
              mark = criterionIndicatorData.value * (criterionIndicatorValue.offer / indicatorMax);
            } else {
              //Пункт 24 б
              mark = criterionIndicatorData.value * (criterionIndicatorValue.offer / criterionIndicatorData.limit);
            }
          }
        } else {
          //Пункт 23
          mark = criterionIndicatorData.value * (criterionIndicatorValue.offer / indicatorMax);
        }
        break;
      case 'L':   //лучшим условием исполнения контракта является наименьшее значение
        var indicatorMin = this._getIndicatorMinOffer(applications, code, criterionIndicatorId);
        if (criterionIndicatorData.limit) {
          if (criterionIndicatorValue.offer <= criterionIndicatorData.limit) {
            //участникам закупки, сделавшим предложение, соответствующее такому значению,
            //или лучшее предложение, присваивается 100 баллов
            mark = 100;
          } else {
            if (criterionIndicatorValue.offer == 0) {
              mark = 0;
            } else if (indicatorMin > criterionIndicatorData.limit) {
              //Пункт 22 а
              mark = criterionIndicatorData.value * (indicatorMin / criterionIndicatorValue.offer);
            } else {
              //Пункт 22 б
              mark = criterionIndicatorData.value * (criterionIndicatorData.limit / criterionIndicatorValue.offer);
            }
          }
        } else {
          //пункт 21
          if (criterionIndicatorValue.offer == 0) {
            mark = 0;
          } else {
            mark = criterionIndicatorData.value * (indicatorMin / criterionIndicatorValue.offer);
          }
        }
        break;
      case 'O':   //оценка производится по шкале оценки или другому порядку, указанному в документации
        break;
      default:
        break;
    }
    if (mark != null) {
      criterionValue.po_model_criterionindicatorvalues[0].score = mark;
      criterionValue.po_model_criterionindicatorvalues[0].normed_score = this.calcNormedScore(mark, criterionIndicatorData.value);
    }
    return criterionValue;
  },
  /**
   *
   * @param score
   * @param norma
   * @returns {number}
   */
  calcNormedScore: function(score, norma) {
    return Math.round(score * norma * 100) / 100 / 100;
  },
  /**
   * Минимальное предложение code
   *
   * @param applications
   * @returns {*}
   * @private
   * @param code
   */
  _getCodeMin: function (applications, code) {
    var min = null;
    Ext.each(applications, function (application) {
      Ext.each(application.po_model_applicationcriterionvalues, function (criterionValue) {
        if (criterionValue.criterion_code == code && (min == null || criterionValue.offer < min)) {
          min = criterionValue.offer;
        }
      });
    }, this);
    return min;
  },
  /**
   * Максимальное предложение code
   *
   * @param applications
   * @returns {*}
   * @private
   * @param code
   */
  _getCodeMax: function (applications, code) {
    var max = null;
    Ext.each(applications, function (application) {
      Ext.each(application.po_model_applicationcriterionvalues, function (criterionValue) {
        if (criterionValue.criterion_code == code && (max == null || criterionValue.offer > max)) {
          max = criterionValue.offer;
        }
      });
    }, this);
    return max;
  },
  /**
   * Возвращает данные об индикаторе
   *
   * @param criterions
   * @param code
   * @param criterionIndicatorId
   * @returns {string}
   * @private
   */
  _getCriterionIndicatorData: function (criterions, code, criterionIndicatorId) {
    var criterionIndicatorData = '';
    Ext.each(criterions, function (criterion) {
      if (criterion.criterion_code == code) {
        Ext.each(criterion.po_model_criterionindicator, function (indicator) {
          if (indicator.id == criterionIndicatorId) {
            criterionIndicatorData = indicator;
          }
        });
      }
    });
    return criterionIndicatorData;
  },
  /**
   * Возвращает данные о критерии
   *
   * @param criterions
   * @param code
   * @returns {string}
   * @private
   */
  _getCriterionData: function (criterions, code) {
    var criterionData = '';
    Ext.each(criterions, function (criterion) {
      if (criterion.criterion_code == code) {
        criterionData = criterion;
      }
    });
    return criterionData;
  },
  /**
   * Минимальное значение индикатора
   *
   * @param applications
   * @param code
   * @param criterionIndicatorId
   * @returns {*}
   * @private
   */
  _getIndicatorMinOffer: function (applications, code, criterionIndicatorId) {
    var min = null;
    Ext.each(applications, function (application) {
      Ext.each(application.po_model_applicationcriterionvalues, function (criterionValue) {
        if (criterionValue.criterion_code == code) {
          Ext.each(criterionValue.po_model_criterionindicatorvalues, function (indicator) {
            if (indicator.criterion_indicator_id == criterionIndicatorId &&
              (min == null || indicator.offer < min)
            ) {
              min = indicator.offer;
            }
          });
        }
      });
    }, this);
    return min;
  },
  /**
   * Максимальное значение индикатора
   *
   * @param applications
   * @param code
   * @param criterionIndicatorId
   * @returns {*}
   * @private
   */
  _getIndicatorMaxOffer: function (applications, code, criterionIndicatorId) {
    var max = null;
    Ext.each(applications, function (application) {
      Ext.each(application.po_model_applicationcriterionvalues, function (criterionValue) {
        if (criterionValue.criterion_code == code) {
          Ext.each(criterionValue.po_model_criterionindicatorvalues, function (indicator) {
            if (indicator.criterion_indicator_id == criterionIndicatorId &&
              (max == null || indicator.offer > max)
            ) {
              max = indicator.offer;
            }
          });
        }
      });
    }, this);
    return max;
  }
};