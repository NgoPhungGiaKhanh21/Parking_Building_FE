import { Breadcrumb } from "antd";
import text from "@/mocks/breadcrumbItem.json";
import PropTypes from "prop-types";

const CommonBreadcrumb = ({ role, page }) => {
  let items = [{ title: text.home }];

  if (role) {
    // Nếu có role, thì thêm Role và Page vào Breadcrumb
    const roleTitle = text[role]?.title;
    const pageTitle = text[role]?.pages?.[page];
    if (roleTitle) items.push({ title: roleTitle });
    if (pageTitle) items.push({ title: pageTitle });
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
};

export default CommonBreadcrumb;
