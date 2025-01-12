const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const formattedToday = `${year}-${day}-${month}`;
  return formattedToday;
};

export default getFormattedDate;
