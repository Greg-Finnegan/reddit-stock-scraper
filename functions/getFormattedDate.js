const getFormattedDate = () => {
  const date = new Date();
  let month = date.getMonth() // zero-based
  const day = date.getDate();
  const year = date.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }
  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
};

export default getFormattedDate;
