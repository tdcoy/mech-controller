export const math = (function () {
  return {
    Lerp: function (x, a, b) {
      return x * (b - a) + a;
    },

    Clamp: function (x, a, b) {
      return Math.min(Math.max(x, a), b);
    },

    Sat: function (x) {
      return Math.min(Math.max(x, 0.0), 1.0);
    },

    Rad2Deg: function () {
      return 180 / Math.PI;
    },

    Deg2Rad: function () {
      return Math.PI / 180;
    },
  };
})();
