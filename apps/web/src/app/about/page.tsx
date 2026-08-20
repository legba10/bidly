import { PublicInformationPage } from '../../components/public-information-page';
import { ruRU } from '../../i18n/messages/ru-RU';

export default function AboutPage() {
  return <PublicInformationPage {...ruRU.about} />;
}
