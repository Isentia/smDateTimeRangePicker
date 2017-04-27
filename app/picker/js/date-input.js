/* global moment */
function dateInput(moment, alerts) {
    'ng-inject';

    function link(scope, element, attrs, ctrls) {
      var dateFormat = attrs.dateInput || 'DD MMM YYYY HH:mm';
      var ngModelCtrl = ctrls[0];
      var RangePickerCtrl = ctrls[1];

      attrs.$observe('dateInput', function(nv) {
        if (!nv || dateFormat == nv || !ngModelCtrl.$modelValue) return;

        dateFormat = nv;
        ngModelCtrl.$modelValue = moment(ngModelCtrl.$setViewValue);
      });

      ngModelCtrl.$formatters.unshift(function(modelValue) {
        if (!dateFormat || !modelValue) return '';

        return moment(modelValue).format(dateFormat);
      });

      ngModelCtrl.$parsers.unshift(function(viewValue) {
        var date = moment(viewValue, dateFormat);

        if (date && date.isValid() && date.year() > 1950) return date;
      });

      ngModelCtrl.$validators.range = function(modelValue, viewValue) {
        var result = isEnabled(modelValue);

        if (!result) {
          scope.$emit('range-picker:input-error', 'date out of range');
        } else {
          scope.$emit('range-picker:input-ok');
        }
        return result;
      }

      function isEnabled(date) {
        var result = true;

        if (RangePickerCtrl.minDate) {
          if (date.isBefore(RangePickerCtrl.minDate)) result = false;
        }

        if (RangePickerCtrl.maxDate) {
          if (date.isAfter(RangePickerCtrl.maxDate)) result = false;
        }

        return result;
      }
    }

    return {
      require: ['^ngModel', '^^smRangePicker'],
      restrict: 'A',
      link: link
    }
}

var app = angular.module('smDateTimeRangePicker');
app.directive('dateInput', ['moment', 'alerts', dateInput]);
