class PermId {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async entitySearch(q) {
        let searchUrl = `https://api.thomsonreuters.com/permid/search?q=${q}&access-token=${this.apiKey}`;
        return this.getResponse(searchUrl);
    }

    async getByPermIdUrl(permIdUrl) {
        if(!permIdUrl) return Promise.resolve({});
        let getUrl = `${permIdUrl}?format=json-ld&access-token=${this.apiKey}`;
        return this.getResponse(getUrl);
    }

    async getResponse(url) {
        return fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            return json;
        });
    }

    async getEntityData(keyword) {
        let searchResult = await this.entitySearch(keyword);
        let entities = searchResult.result.organizations.entities;
        if(entities.lenght === 0)
            return "";

        let orgEntity = await this.getByPermIdUrl(entities[0]['@id']);
        let industryPromise = this.getByPermIdUrl(orgEntity.hasPrimaryIndustryGroup);
        let quotePromise = this.getByPermIdUrl(orgEntity.hasOrganizationPrimaryQuote);

        return Promise.all([industryPromise, quotePromise]).then(function([industryEntity, quoteEntity]) {
            return {
                id : orgEntity['@id'],
                name: orgEntity['vcard:organization-name'],
                address: orgEntity['mdaas:RegisteredAddress'],
                url: orgEntity['hasURL'],
                industry: industryEntity['rdfs:label'],
                RIC: quoteEntity['tr-fin:hasRic'],
                ticker: quoteEntity['tr-fin:hasExchangeTicker'],
                exchange: quoteEntity['tr-fin:hasExchangeCode']
            }
          });
    }
}
