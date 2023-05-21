const typeNotification = (description) => {
  return {
    success: {
      msg: {
        title: "Éxito",
        description,
      },
      config: {
        timeout: 4000,
        showIcon: true,
        type: "success",
        position: "bottom-right",
      },
    },
    danger: {
      msg: {
        title: "Error",
        description,
      },
      config: {
        timeout: 4000,
        showIcon: true,
        type: "danger",
        position: "bottom-right",
      },
    },
  };
};

export default typeNotification;
