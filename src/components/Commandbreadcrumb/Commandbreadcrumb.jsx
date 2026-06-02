import { Breadcrumb } from "antd";
import text from "@/mocks/breadcrumbItem.json";
import PropTypes from "prop-types";

const CommonBreadcrumb = ({ role, page, subPage }) => {
  let items = [{ title: text.home }];

  if (role) {
    // Nếu có role, thì thêm Role và Page vào Breadcrumb
    const roleTitle = text[role]?.title;
    const pageTitle = text[role]?.pages?.[page];
    const subPageTitle = subPage ? text[role]?.pages?.[subPage] : null;
    if (roleTitle) items.push({ title: roleTitle });
    if (pageTitle) items.push({ title: pageTitle });
    if (subPageTitle) items.push({ title: subPageTitle });
  } else {
    // Nếu không có role => Trang thuộc Profile
    const profileTitle = text.profile?.[page];
    if (profileTitle) items.push({ title: profileTitle });
  }

  return (
    <Breadcrumb
      className="normalText !text-base"
      items={items.map((item) => ({
        title: item.title,
      }))}
    />
  );
};

CommonBreadcrumb.propTypes = {
  role: PropTypes.string,
  page: PropTypes.string.isRequired,
  subPage: PropTypes.string,
};

export default CommonBreadcrumb;
