'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

const hotspotContent = {
  networks: ['HT line networks', 'Overhead connections link incoming electrical supply with developments and industrial sites. Explore HT and LT line works below.'],
  substations: ['11 kV / 33 kV infrastructure', 'Substation works form part of the connection between the incoming network and the electrical needs of a site.']
};
const hotspotDetail = document.querySelector('#hotspot-detail');
function closeHotspots() {
  document.querySelectorAll('[data-hotspot]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  hotspotDetail.hidden = true;
}
document.querySelectorAll('[data-hotspot]').forEach(button => {
  button.setAttribute('aria-controls', 'hotspot-detail');
  button.addEventListener('click', () => {
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    closeHotspots();
    if (wasOpen) return;
    const [title, copy] = hotspotContent[button.dataset.hotspot];
    const heading = document.createElement('strong');
    heading.textContent = title;
    hotspotDetail.replaceChildren(heading, document.createTextNode(copy));
    hotspotDetail.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  });
});
document.addEventListener('click', event => { if (!event.target.closest('.hero-visual')) closeHotspots(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHotspots(); });

const services = {
  ht: { title: 'HT & LT line works', description: 'Plan overhead electrical connections for a new site or an extension to an existing network. HT works support developments and industrial requirements; LT distribution serves buildings and household connections.', items: ['New overhead line routes and site distribution requirements', 'Pole locations, access and connections to existing infrastructure', 'Project voltage, load requirements and utility coordination'], selection: 'HT & LT line works' },
  shifting: { title: 'Electrical line shifting', description: 'Create space for construction and infrastructure changes by planning the relocation of existing lines or poles. The scope starts with the existing route and the proposed site layout.', items: ['Relocation needed for roads, buildings or site redevelopment', 'Existing line details and the proposed alternative route', 'Access, utility permissions and work sequencing'], selection: 'Electrical line shifting' },
  cabling: { title: 'Underground cable works', description: 'Bring electrical connections below ground with cable works for 11 kV and 33 kV networks and LT distribution. Define the route and installation scope around the specific conditions of your site.', items: ['Proposed cable route and approximate route length', 'Trenching, ducts and associated site infrastructure', 'Cable connections, reinstatement and agreed testing scope'], selection: 'Underground cable works' },
  substation: { title: 'Substation infrastructure', description: 'Connect the larger picture with 11 kV and 33 kV substation works. Establish the incoming supply, site needs and connected electrical works as part of one coordinated scope.', items: ['Incoming supply and the site’s electrical requirements', 'Substation location, access and equipment installation scope', 'Associated cabling, site works and handover requirements'], selection: 'Substation infrastructure' }
};
const serviceDialog = document.querySelector('#service-dialog');
let lastServiceTrigger;
let selectedService;
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  selectedService = services[button.dataset.service];
  lastServiceTrigger = button;
  document.querySelector('#dialog-title').textContent = selectedService.title;
  document.querySelector('#dialog-description').textContent = selectedService.description;
  document.querySelector('#dialog-list').replaceChildren(...selectedService.items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  serviceDialog.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.dialog-close').addEventListener('click', () => serviceDialog.close());
serviceDialog.addEventListener('click', event => {
  if (event.target !== serviceDialog) return;
  const bounds = serviceDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) serviceDialog.close();
});
serviceDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  lastServiceTrigger?.focus({ preventScroll: true });
});
document.querySelector('#dialog-cta').addEventListener('click', () => {
  document.querySelector('#enquiry-service').value = selectedService.selection;
  document.querySelector('#enquiry-service').dispatchEvent(new Event('input', { bubbles: true }));
  serviceDialog.close();
  setTimeout(() => document.querySelector('[name="name"]').focus({ preventScroll: true }), 100);
});

const sectors = {
  residential: { kicker: 'FOR THE PLACES WE CALL HOME', title: 'Good living starts with\na reliable connection.', text: 'From individual homes to residential developments, connect everyday living with carefully planned electrical works.', items: ['Household and building LT cabling', 'Underground routes for cleaner surroundings', 'Line shifting for new construction'] },
  commercial: { kicker: 'FOR THE SPACES THAT KEEP BUSINESS MOVING', title: 'Built for business.\nConnected for what’s next.', text: 'Coordinate the electrical infrastructure for offices, retail properties and growing commercial developments around the needs of each site.', items: ['Building and site electrical distribution', 'Cable routes for new and expanded premises', 'Line relocation for changing site layouts'] },
  industrial: { kicker: 'FOR THE PLACES THAT POWER PROGRESS', title: 'Infrastructure for\nbigger ambitions.', text: 'Bring incoming supply, HT networks and substation works together for industrial sites, manufacturing facilities and expanding operations.', items: ['HT overhead line works and incoming supply', '11 kV / 33 kV underground cable works', 'Substation infrastructure and connected site works'] }
};
const sectorTabs = [...document.querySelectorAll('[data-sector]')];
function selectSector(button) {
  const sector = sectors[button.dataset.sector];
  sectorTabs.forEach(tab => { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
  const panel = document.querySelector('#sector-panel');
  panel.setAttribute('aria-labelledby', button.id);
  panel.querySelector('.sector-kicker').textContent = sector.kicker;
  const titleLines = sector.title.split('\n');
  panel.querySelector('h3').replaceChildren(document.createTextNode(titleLines[0]), document.createElement('br'), document.createTextNode(titleLines[1]));
  panel.querySelector('p').textContent = sector.text;
  panel.querySelectorAll('.check-list li').forEach((li, index) => { while (li.childNodes.length > 1) li.removeChild(li.lastChild); li.append(document.createTextNode(sector.items[index])); });
  document.querySelector('#sector-cta').replaceChildren(document.createTextNode('Discuss your ' + button.dataset.sector + ' project '), Object.assign(document.createElement('span'), { textContent: '↗' }));
}
sectorTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectSector(button));
  button.addEventListener('keydown', event => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % sectorTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sectorTabs.length) % sectorTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = sectorTabs.length - 1;
    if (nextIndex !== undefined) { event.preventDefault(); selectSector(sectorTabs[nextIndex]); sectorTabs[nextIndex].focus(); }
  });
});

const enquiryForm = document.querySelector('#enquiry-form');
enquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = ['name', 'email', 'location', 'service', 'details'];
  for (const field of fields) {
    const input = enquiryForm.elements[field];
    input.setCustomValidity(input.value.trim() ? '' : 'Please complete this field.');
  }
  if (!enquiryForm.reportValidity()) return;
  const values = new FormData(enquiryForm);
  const subject = 'Project enquiry - ' + values.get('service');
  const body = ['Hello TNS Infrasolutions,', '', 'I would like to discuss the following project:', '', 'Name: ' + values.get('name').trim(), 'Email: ' + values.get('email').trim(), 'Location: ' + values.get('location').trim(), 'Service: ' + values.get('service'), '', 'PROJECT DETAILS', values.get('details').trim()].join('\r\n');
  const mailto = 'mailto:sivaram@tnsinfrasolution.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  const success = document.querySelector('#form-success');
  success.querySelector('.email-fallback').href = mailto;
  success.hidden = false;
  window.location.href = mailto;
});
enquiryForm.addEventListener('input', event => {
  if ('setCustomValidity' in event.target) event.target.setCustomValidity('');
  const success = document.querySelector('#form-success');
  success.hidden = true;
  success.querySelector('.email-fallback').href = 'mailto:sivaram@tnsinfrasolution.com';
});
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
  document.querySelectorAll('.section-heading, .service-card, .solutions-copy, .steps article, .faq-layout, .contact-copy').forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}
