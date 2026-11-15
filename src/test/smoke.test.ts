import { describe, expect, it } from 'vitest';
import i18n from '../i18n';

describe('arranque', () => {
  it('i18n cambia de idioma con una clave de prueba', async () => {
    await i18n.changeLanguage('es');
    expect(i18n.t('ui:brand')).toBe('ÚLTIMA SEÑAL');
    await i18n.changeLanguage('en');
    expect(i18n.t('ui:brand')).toBe('LAST SIGNAL');
  });
});
