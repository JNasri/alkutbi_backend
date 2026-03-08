const duplicateCheck = async (Model, data, config) => {
  if (!config.enabled) return [];

  const { fields } = config;
  const query = {
    dateAD: data.dateAD, // Check within the same day
  };

  fields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== "" && data[field] !== null) {
      query[field] = data[field];
    }
  });

  // Exclude current record if it's an update (though we only care about creation for now)
  if (data.id) {
    query._id = { $ne: data.id };
  }

  const duplicates = await Model.find(query).lean().exec();
  return duplicates;
};

module.exports = duplicateCheck;
